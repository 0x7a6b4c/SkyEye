import asyncio
from collections import defaultdict, deque
import logging
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import DefaultDict, Deque, List, Optional, Dict
import os
import json

from sse_starlette import EventSourceResponse

from resources.utils import ensure_completed_scan_folder, load_credentials_from_json, update_max_threads
from resources.mode_loader import singleUserSeparationMode, multipleUserCrossMode
from resources.modules import iam_permission_fuzzing
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
    accounts: List[AccountSummary]


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
    """Kick off a background scan and return a session id."""
    # Configure global thread pool
    update_max_threads(scan_form.thread)

    # Prepare workspace
    session_folder = ensure_completed_scan_folder()
    session_id = os.path.basename(session_folder)

    # Initialise session state
    scan_status[session_id] = {"state": "running", "error": None}

    # Validate credentials list
    credentials_list = [c.model_dump() for c in scan_form.credentials]
    if not credentials_list:
        raise HTTPException(status_code=400, detail="At least one credential is required")

    # Validate mode
    if scan_form.mode not in ("separate-entities", "cross-entities"):
        raise HTTPException(status_code=400, detail="mode must be 'separate-entities' or 'cross-entities'")

    # Single‑credential constraints
    if len(credentials_list) == 1:
        if scan_form.mode != "separate-entities":
            raise HTTPException(status_code=400, detail="Single credential can only use 'separate-entities' mode")
    else:
        if scan_form.fuzz:
            raise HTTPException(status_code=400, detail="Fuzzing not allowed with multiple credentials")

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
            if scan_form.mode == "cross-entities":
                multipleUserCrossMode(credentials_list, session_folder)
            else:
                singleUserSeparationMode(credentials_list, session_folder, "separate")

            # Optional fuzzing
            if scan_form.fuzz:
                scan_status[session_id]["state"] = "fuzzing"
                iam_permission_fuzzing(credentials_list[0], session_folder)

            # Mark success
            scan_status[session_id]["state"] = "completed"
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

    if record["state"] == "failed":
        raise HTTPException(status_code=500, detail=record["error"] or "Scan failed")

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


@app.get("/sessions", response_model=List[str])
async def list_sessions():
    base = "completed_scan"
    if not os.path.exists(base):
        return []
    return sorted(os.listdir(base))


@app.get("/sessions/{session_id}/{account_id}/{access_key}")
async def get_credential_output(session_id: str, account_id: str, access_key: str):
    account_path = os.path.join("completed_scan", session_id, account_id)
    if not os.path.isdir(account_path):
        raise HTTPException(status_code=404, detail="Account not found")

    for prefix in [
        "seperate_scanningOutputCredentialSet",
        "cross_scanningOutputCredentialSet",
        "single_fuzzingOutputCredentialSet",
    ]:
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

    accounts: List[AccountSummary] = []
    for acct in sorted(os.listdir(base_path)):
        acct_path = os.path.join(base_path, acct)
        if not os.path.isdir(acct_path):
            continue
        users: List[CredentialSummary] = []
        for fname in os.listdir(acct_path):
            if not fname.endswith(".json"):
                continue
            parts = fname.rsplit("_", 1)
            if len(parts) != 2:
                continue
            key = parts[1].replace(".json", "")
            try:
                with open(os.path.join(acct_path, fname), "r", encoding="utf-8") as f:
                    data = json.load(f)
                user = data.get("UserName") or data.get("userName")
            except Exception:
                user = None
            users.append(CredentialSummary(userAccessKey=key, userName=user))
        accounts.append(AccountSummary(accountId=acct, userIds=users))

    return SessionData(accounts=accounts)

