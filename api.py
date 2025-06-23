import asyncio
from collections import defaultdict, deque
import datetime
import logging
from uuid import uuid4
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import DefaultDict, Deque, List, Literal, Optional, Dict
import os
import json
from pathlib import Path

from sse_starlette import EventSourceResponse

from resources.utils import configure_logging, ensure_completed_scan_folder, load_credentials_from_json, update_max_threads
from resources.mode_loader import singleUserSeparationMode, multipleUserCrossMode
from resources.modules import iam_permission_fuzzing, update_aws_managed_policies, update_iam_operations, update_mitre_attack_cloud_data
from resources.threads_config import MAX_THREADS

from resources.utils import ensure_completed_scan_folder, load_credentials_from_json, update_max_threads
from resources.mode_loader import singleUserSeparationMode, multipleUserCrossMode
from resources.modules import iam_permission_fuzzing
from resources.threads_config import MAX_THREADS

# ────────────────────────────────────────────────────────────────────────────────
# Logging capture for live streaming to the React UI
# ────────────────────────────────────────────────────────────────────────────────
MAX_LOG_LINES = 5_000  # rolling buffer per session

# session_id -> deque[str]
scan_logs: DefaultDict[str, Deque[str]] = defaultdict(lambda: deque(maxlen=MAX_LOG_LINES))


class SessionLogHandler(logging.Handler):
    """A logging.Handler that pushes formatted records into scan_logs."""

    def __init__(self, session_id: str) -> None:
        super().__init__()
        self.session_id = session_id
        self.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))

    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            scan_logs[self.session_id].append(msg)
        except Exception:  # pragma: no cover – never let logging crash the app
            self.handleError(record)


# ────────────────────────────────────────────────────────────────────────────────
# In‑memory state bookkeeping
# ────────────────────────────────────────────────────────────────────────────────
# { session_id: { "state": "running|fuzzing|completed|failed", "error": str|None } }
scan_status: Dict[str, Dict[str, Optional[str]]] = {}

# Update tracking state
MAX_UPDATE_LOG_LINES = 5000
update_logs: DefaultDict[str, Deque[str]] = defaultdict(lambda: deque(maxlen=MAX_UPDATE_LOG_LINES))
update_status: Dict[str, Dict[str, Optional[str]]] = {}

class UpdateLogHandler(logging.Handler):
    """Logging handler for update tasks."""
    def __init__(self, update_id: str) -> None:
        super().__init__()
        self.update_id = update_id
        self.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            update_logs[self.update_id].append(msg)
        except Exception:
            self.handleError(record)

class UpdateForm(BaseModel):
    # List of update operations to perform: each must be one of the supported types
    types: List[str] = Field(..., description="Array of update types to run")
    thread: int = MAX_THREADS

class UpdateResponse(BaseModel):
     update_id: str


# ────────────────────────────────────────────────────────────────────────────────
# Pydantic models
# ────────────────────────────────────────────────────────────────────────────────
class Credential(BaseModel):
    AccessKey: str
    SecretKey: str
    SessionToken: Optional[str] = ""
    Region: Optional[str] = "us-east-1"


class ScanForm(BaseModel):
    credentials: List[Credential]
    mode: str = "separate-entities"  # 'separate-entities' or 'cross-entities'
    thread: int = MAX_THREADS
    fuzz: bool = False  # IAM fuzzing (allowed only for single credential)


class ScanResponse(BaseModel):
    session_id: str


class CredentialSummary(BaseModel):
    userAccessKey: str
    userName: Optional[str]


class AccountSummary(BaseModel):
    accountId: str
    userIds: List[CredentialSummary]


class SessionData(BaseModel):
    mode: str
    accounts: List[AccountSummary]

class Node(BaseModel):
    id: str = Field(..., description="Unique identifier (we use a UUID by default)")
    name: str
    type: Literal["folder", "file"]
    children: Optional[List["Node"]] = None  # populated only for folders
    link: Optional[str] = None  # frontend URL for file nodes

    class Config:  # allow recursive model
        orm_mode = True


Node.model_rebuild()



# ────────────────────────────────────────────────────────────────────────────────
# FastAPI app + CORS
# ────────────────────────────────────────────────────────────────────────────────
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ────────────────────────────────────────────────────────────────────────────────
# API endpoints
# ────────────────────────────────────────────────────────────────────────────────
@app.post("/scan", response_model=ScanResponse, status_code=202)
async def scan_endpoint(scan_form: ScanForm, background_tasks: BackgroundTasks):

    # Validate credentials list
    credentials_list = [c.model_dump() for c in scan_form.credentials]
    if not credentials_list:
        raise HTTPException(status_code=400, detail="At least one credential is required")

    # Validate mode
    if scan_form.mode not in ("separate-entity", "cross-entity"):
        raise HTTPException(status_code=400, detail="mode must be 'separate-entities' or 'cross-entities'")

    # Single‑credential constraints
    if len(credentials_list) == 1:
        if scan_form.mode != "separate-entity":
            raise HTTPException(status_code=400, detail="Single credential can only use 'separate-entities' mode")
    else:
        if scan_form.fuzz:
            raise HTTPException(status_code=400, detail="Fuzzing not allowed with multiple credentials")
    # Configure global thread pool
    update_max_threads(scan_form.thread)
    mode = scan_form.mode
    if len(credentials_list) == 1:
        mode = "single-entity"
    # Prepare workspace
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    session_folder = ensure_completed_scan_folder(mode, timestamp)
    session_id = os.path.basename(session_folder)

    # Initialise session state
    scan_status[session_id] = {"state": "running", "error": None}
    log_listener = configure_logging(timestamp)
    # Background task worker
    def task() -> None:
        logger = logging.getLogger()
        if logger.level > logging.INFO:
            logger.setLevel(logging.INFO)
        handler = SessionLogHandler(session_id)
        handler.setLevel(logging.INFO)
        logger.addHandler(handler)
        try:
            # Main scan
            if len(credentials_list) > 1:
                if scan_form.mode == "cross-entity":
                    multipleUserCrossMode(credentials_list, session_folder)
                else:
                    singleUserSeparationMode(credentials_list, session_folder)
            else:
                # Single credential scan
                singleUserSeparationMode(credentials_list, session_folder, mode="single-entity")
            # Optional fuzzing
                if scan_form.fuzz:
                    scan_status[session_id]["state"] = "fuzzing"
                    iam_permission_fuzzing(credentials_list[0], session_folder)

            # Mark success
            scan_status[session_id]["state"] = "completed"
            log_listener.stop()
        except Exception as exc:
            scan_status[session_id]["state"] = "failed"
            scan_status[session_id]["error"] = str(exc)
            logger.exception("Scan task %s failed", session_id)
        finally:
            logger.removeHandler(handler)

    background_tasks.add_task(task)
    return {"session_id": session_id}


@app.get("/sessions/{session_id}/status")
async def get_scan_status(session_id: str):
    record = scan_status.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail="Session not found or not started")

    return {"status": record["state"]}


@app.get("/sessions/{session_id}/logs")
async def stream_logs(session_id: str):
    if session_id not in scan_status:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator():
        last_len = 0
        while True:
            await asyncio.sleep(0.5)  # tune to taste
            logs = scan_logs.get(session_id)
            if logs is None:
                break  # purged
            for line in list(logs)[last_len:]:
                yield f"data: {line}\n\n"
            last_len = len(logs)
            if scan_status[session_id]["state"] in ("completed", "failed") and last_len == len(logs):
                break

    return EventSourceResponse(event_generator())


@app.get("/sessions", response_model=List[Node])
async def list_sessions() -> List[Node]:
    root = Path("completed_scan")
    if not root.exists():
        return []
    # Group sessions by date prefix
    date_groups: Dict[str, List[str]] = defaultdict(list)
    for entry in sorted(root.iterdir()):
        if not entry.is_dir():
            continue
        # folder format: YYYY-MM-DD_HH-MM-SS_mode
        raw_date = entry.name.split('_', 1)[0]
        date_groups[raw_date].append(entry.name)
    nodes: List[Node] = []
    for raw_date in sorted(date_groups.keys(), reverse=True):
        # format date as 'YYYY - MM - DD'
        date_parts = raw_date.split('-')
        display_date = '-'.join(date_parts)
        children: List[Node] = []
        for session_id in sorted(date_groups[raw_date], reverse=True):
            # parse time portion
            parts = session_id.split('_')
            if len(parts) >= 2:
                time_raw = parts[1]
                display_time = time_raw.replace('-', ':')
            else:
                display_time = ''
            display_name = f"{display_date} {display_time}".strip()
            children.append(
                Node(
                    id=session_id,
                    name=display_name,
                    type="file",
                    link=f"/aws/history/{session_id}",
                )
            )
        nodes.append(
            Node(
                id=str(uuid4()),
                name=display_date,
                type="folder",
                children=children,
            )
        )
    return nodes


@app.get("/sessions/{session_id}/{account_id}/{access_key}")
async def get_credential_output(
    session_id: str,
    account_id: str,
    access_key: str,
    mode: Optional[str] = None  # 'scan' or 'fuzz'
):
    account_path = os.path.join("completed_scan", session_id, account_id)
    if not os.path.isdir(account_path):
        raise HTTPException(status_code=404, detail="Account not found")

    # Determine which file to return based on mode
    prefixes = []
    if mode:
        if mode.lower() in ("fuzz", "fuzzing"):
            prefixes = ["fuzzingOutputCredentialSet"]
        elif mode.lower() in ("scan", "scanning"):
            prefixes = ["scanningOutputCredentialSet"]
        else:
            raise HTTPException(status_code=400, detail="mode must be 'scan' or 'fuzz'")
    else:
        # default order: scan first, then fuzz
        prefixes = ["fuzzingOutputCredentialSet", "scanningOutputCredentialSet"]
    # Look for matching output file
    for prefix in prefixes:
        filename = f"{prefix}_{access_key}.json"
        path = os.path.join(account_path, filename)
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as f:
                return JSONResponse(content=json.load(f))

    raise HTTPException(status_code=404, detail="Credential output not found")


@app.get("/sessions/{session_id}", response_model=SessionData)
async def get_session(session_id: str):
    base_path = os.path.join("completed_scan", session_id)
    if not os.path.isdir(base_path):
        raise HTTPException(status_code=404, detail="Session not found")

    # Determine session mode from folder suffix
    raw_mode = session_id.split("_", 2)[2]
    if raw_mode == 'cross-entity':
        mode = 'cross'
    elif raw_mode == 'separate-entity':
        mode = 'separate'
    elif raw_mode == 'single-entity':
        # detect if fuzzing output exists to classify as singleFuzz
        fuzz_present = False
        for acct in os.listdir(base_path):
            acct_path = os.path.join(base_path, acct)
            if not os.path.isdir(acct_path):
                continue
            for fname in os.listdir(acct_path):
                if 'fuzzingOutputCredentialSet' in fname.lower() or len(json.loads(open(os.path.join(acct_path, fname)).read())) == 1:
                    fuzz_present = True
                    break
            if fuzz_present:
                break
        mode = 'singleFuzz' if fuzz_present else 'single'
    else:
        mode = raw_mode
    accounts: List[AccountSummary] = []
    for acct in sorted(os.listdir(base_path)):
        acct_path = os.path.join(base_path, acct)
        if not os.path.isdir(acct_path):
            continue
        # Single-entity fuzz: only return the fuzzing output
        if mode == 'singleFuzz':
            users: List[CredentialSummary] = []
            # pick fuzzing file(s)
            fuzz_files = [f for f in os.listdir(acct_path) if f.startswith('fuzzingOutputCredentialSet_') and f.endswith('.json')]
            if fuzz_files:
                # there should be one per account
                fname = fuzz_files[0]
                key = fname.rsplit('_', 1)[1].replace('.json', '')
                try:
                    with open(os.path.join(acct_path, fname), 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    # unwrap fuzzing wrapper
                    if isinstance(data, dict) and len(data) == 1 and isinstance(next(iter(data.values())), dict):
                        inner = next(iter(data.values()))
                        user = inner.get('UserName') or inner.get('userName')
                    else:
                        user = data.get('UserName') or data.get('userName')
                except Exception:
                    user = None
                users.append(CredentialSummary(userAccessKey=key, userName=user))
            accounts.append(AccountSummary(accountId=acct, userIds=users))
            continue
        # default handling: dedupe across scan and fuzz outputs
        users: List[CredentialSummary] = []
        seen_keys: set = set()
        for fname in os.listdir(acct_path):
            if not fname.endswith('.json'):
                continue
            parts = fname.rsplit('_', 1)
            if len(parts) != 2:
                continue
            key = parts[1].replace('.json', '')
            if key in seen_keys:
                continue
            seen_keys.add(key)
            try:
                with open(os.path.join(acct_path, fname), 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if isinstance(data, dict) and len(data) == 1 and isinstance(next(iter(data.values())), dict):
                    inner = next(iter(data.values()))
                    user = inner.get('UserName') or inner.get('userName')
                else:
                    user = data.get('UserName') or data.get('userName')
            except Exception:
                user = None
            users.append(CredentialSummary(userAccessKey=key, userName=user))
        accounts.append(AccountSummary(accountId=acct, userIds=users))
    return SessionData(mode=mode, accounts=accounts)


@app.post("/update", response_model=UpdateResponse, status_code=202)
async def update_endpoint(form: UpdateForm, background_tasks: BackgroundTasks):
    update_id = str(uuid4())
    # validate types
    if not form.types:
        raise HTTPException(status_code=400, detail="At least one update type is required")
    
    update_max_threads(form.thread)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_listener = configure_logging(timestamp, "update")
    # Background update task
    def task():
        logger = logging.getLogger()
        if logger.level > logging.INFO:
            logger.setLevel(logging.INFO)
        handler = UpdateLogHandler(update_id)
        handler.setLevel(logging.INFO)
        logger.addHandler(handler)
        update_status[update_id] = {"state": "running", "error": None}
        try:
            # Run each requested update operation
            for update_type in form.types:
                if update_type == "mitre-attack-cloud":
                    update_mitre_attack_cloud_data()
                elif update_type == "aws-actions":
                    update_iam_operations()
                elif update_type == "aws-managed-policies":
                    update_aws_managed_policies()
            update_status[update_id]["state"] = "completed"
            log_listener.stop()
        except Exception as exc:
            update_status[update_id]["state"] = "failed"
            update_status[update_id]["error"] = str(exc)
            logger.exception("Update task %s failed", update_id)
        finally:
            logger.removeHandler(handler)
    background_tasks.add_task(task)
    return {"update_id": update_id}


@app.get("/update/{update_id}/status")
async def get_update_status(update_id: str):
    record = update_status.get(update_id)
    if not record:
        raise HTTPException(status_code=404, detail="Update session not found")
    return {"status": record["state"]}


@app.get("/update/{update_id}/logs")
async def stream_update_logs(update_id: str):
    if update_id not in update_status:
        raise HTTPException(status_code=404, detail="Update session not found")
    async def event_generator():
        last = 0
        while True:
            await asyncio.sleep(0.5)
            logs = update_logs.get(update_id)
            if logs is None:
                break
            for line in list(logs)[last:]:
                yield f"data: {line}\n\n"
            last = len(logs)
            state = update_status[update_id]["state"]
            if state in ("completed", "failed") and last == len(logs):
                break
    return EventSourceResponse(event_generator())

# Add scan logs summary endpoint
@app.get("/scan/logs")
async def list_scan_logs():
    logs_dir = Path("logs")
    if not logs_dir.exists():
        return []
    # Collect log files sorted newest first
    files = sorted(logs_dir.glob('scanningSession_*.log'))
    results = []
    count = 1
    for log_file in files:
        fname = log_file.name
        # extract timestamp
        ts_part = fname[len('scanningSession_'):-len('.log')]
        try:
            date_str, time_str = ts_part.split('_', 1)
        except ValueError:
            continue
        # format time
        time_formatted = time_str.replace('-', ':')
        # read log lines
        lines = log_file.read_text(encoding='utf-8').splitlines()
        if not lines:
            continue
        # parse first and last timestamps
        def parse_ts(line: str):
            ts_text = line.split(' - ')[0]
            return datetime.datetime.strptime(ts_text, '%Y-%m-%d %H:%M:%S,%f')
        try:
            start_dt = parse_ts(lines[0])
            end_dt = parse_ts(lines[-1])
            duration_td = end_dt - start_dt
            mins, secs = divmod(int(duration_td.total_seconds()), 60)
            duration = f"{mins}m {secs}s"
        except Exception:
            duration = "failed"
        # determine status: failed if any error log present
        status = 'failed' if any('[ERROR]' in line for line in lines) else 'completed'
        # determine type by matching completed_scan folder
        scanned_type = 'update'
        for session_dir in Path('completed_scan').iterdir():
            if session_dir.is_dir() and session_dir.name.startswith(ts_part):
                parts = session_dir.name.split('_', 2)
                if len(parts) >= 3:
                    raw_mode = parts[2]
                    if raw_mode == 'cross-entity':
                        scanned_type = 'cross'
                    elif raw_mode == 'separate-entity':
                        scanned_type = 'separate'
                    elif raw_mode == 'single-entity':
                        scanned_type = 'single'
                break
        # assign id
        entry_id = f"scan_{count:03d}"
        count += 1
        results.append({
            'id': entry_id,
            'date': date_str,
            'time': time_formatted,
            'status': status,
            'duration': duration,
            'type': scanned_type,
        })
    return results

# Download a specific scan log file
@app.get("/scan/logs/{timestamp}")
async def download_scan_log(timestamp: str):
    # timestamp should match format YYYY-MM-DD_HH-MM-SS
    log_path = Path("logs") / f"scanningSession_{timestamp}.log"
    if not log_path.exists() or not log_path.is_file():
        raise HTTPException(status_code=404, detail="Log file not found")
    return FileResponse(
        path=str(log_path),
        media_type="text/plain",
        filename=log_path.name,
    )

@app.get("/scan/logs/{timestamp}/detail")
async def scan_log_detail(timestamp: str):
    # timestamp param in 'YYYY-MM-DD_HH-MM-SS' format
    # split into date and time
    try:
        date_str, time_str = timestamp.rsplit('_', 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    time_formatted = time_str.replace('-', ':')
    log_file = Path('logs') / f"scanningSession_{timestamp}.log"
    if not log_file.exists():
        raise HTTPException(status_code=404, detail="Log file not found")
    # read file lines
    lines = log_file.read_text(encoding='utf-8').splitlines()
    if not lines:
        raise HTTPException(status_code=404, detail="Empty log file")
    # parse start/end timestamps for duration
    def parse_ts(line: str):
        ts_text = line.split(' - ')[0]
        return datetime.datetime.strptime(ts_text, '%Y-%m-%d %H:%M:%S,%f')
    try:
        start_dt = parse_ts(lines[0])
        end_dt = parse_ts(lines[-1])
        delta = end_dt - start_dt
        mins, secs = divmod(int(delta.total_seconds()), 60)
        duration = f"{mins}m {secs}s"
    except Exception:
        duration = ""
    # determine status: failed if any error log present
    status = 'failed' if any('[ERROR]' in line for line in lines) else 'completed'
    # determine type by matching completed_scan folder
    scan_type = 'update'
    for session_dir in Path('completed_scan').iterdir():
        if session_dir.is_dir() and session_dir.name.startswith(timestamp):
            parts = session_dir.name.split('_', 2)
            mode = parts[2] if len(parts) >= 3 else ''
            scan_type = {'cross-entity':'cross','separate-entity':'separate',
                         'single-entity':'single'}.get(mode, 'update')
            break
    # parse logs
    logs_parsed = []
    for line in lines:
        parts = line.split(' - ', 1)
        if len(parts) != 2:
            continue
        ts_text, rest = parts
        level, msg = ('INFO', rest)
        if '] ' in rest:
            lp, msg = rest.split('] ', 1)
            level = lp.strip('[')
        logs_parsed.append({'timestamp':ts_text,'level':level,'message':msg})
    # count JSON files in completed_scan as entities
    entities = 0
    for session_dir in Path('completed_scan').iterdir():
        if session_dir.is_dir() and session_dir.name.startswith(timestamp):
            for acct in session_dir.iterdir():
                if acct.is_dir():
                    entities += len(list(acct.glob('*.json')))
            break
    return JSONResponse(content={
        'id': timestamp,
        'date': date_str,
        'time': time_formatted,
        'status': status,
        'entities': entities,
        'duration': duration,
        'type': scan_type,
        'logs': logs_parsed,
    })