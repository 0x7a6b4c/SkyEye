"""
Copyright (C) 2025  Minh Hoang NGUYEN

This program (SkyEye) is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program (SkyEye) is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

import threading, logging, boto3, importlib
from copy import deepcopy
from concurrent.futures import ThreadPoolExecutor
import resources.threads_config
from . import remove_metadata, save_output_to_file, envEntitiesComplement

class ProcessedTracker:
    def __init__(self):
        self._processed = set()
        self._lock = threading.Lock()

    def add(self, item):
        with self._lock:
            self._processed.add(item)

    def contains(self, item):
        with self._lock:
            return item in self._processed

class PendingTasks:
    def __init__(self):
        self._count = 0
        self._lock = threading.Lock()
        self._cv = threading.Condition(self._lock)
    
    def increment(self):
        with self._lock:
            self._count += 1
    
    def decrement(self):
        with self._lock:
            self._count -= 1
            if self._count == 0:
                self._cv.notify_all()
    
    def wait_zero(self):
        with self._lock:
            while self._count > 0:
                self._cv.wait()

def get_assumable_roles(principal_arn, role_list):
    assumable = []
    for role in role_list:
        for statement in role.get("AssumeRolePolicyStatement", []):
            if statement.get("Effect") != "Allow":
                continue
            actions = statement.get("Action", [])
            actions = [actions] if isinstance(actions, str) else actions
            if "sts:AssumeRole" not in actions:
                continue

            principals = []
            aws_principals = statement.get("Principal", {}).get("AWS", [])
            if isinstance(aws_principals, str):
                aws_principals = [aws_principals]
            principals.extend(aws_principals)

            service_principals = statement.get("Principal", {}).get("Service", [])
            if isinstance(service_principals, str):
                service_principals = [service_principals]
            principals.extend(service_principals)

            if principal_arn in principals:
                assumable.append(role["Arn"])
    return assumable

def assumed_role_enum_task(envData, reScanEnvEntities, role_list, current_arn, arn_list, stop_event, new_session, path, region, executor, pending_tasks, processed):
    try:
        if stop_event.is_set():
            return
        if "/role/" in current_arn and processed.contains(current_arn):
            return
        sts_client = new_session.client("sts")
        try:
            identity = sts_client.get_caller_identity()
        except Exception as e:
            return
        else:
            if stop_event.is_set():
                return
            if identity['Arn'].split(':')[5].split('/')[0] == "assumed-role":
                logging.info(f"Complementing IAMs by [AssumedRole Session] : [{'] → ['.join(path)}]")
                envEntitiesComplement(new_session, reScanEnvEntities, envData, arn_list, "assumed-role")
                with envData.all_context() as envAll:
                    if envAll:
                        logging.info(f"Identified get_account_authorization_details permissions at [{identity['Arn']}]!")
                        logging.info("Terminating all threads!")
                        stop_event.set()
                        return

        target_roles = get_assumable_roles(current_arn, role_list)

        for role_arn in target_roles:
            if stop_event.is_set():
                return
            if role_arn in path or processed.contains(role_arn):
                continue
            
            try:
                assumed_role = sts_client.assume_role(
                    RoleArn=role_arn,
                    RoleSessionName=f"EnumSession-{threading.get_ident()}"
                )
                credentials = assumed_role["Credentials"]

                if stop_event.is_set():
                    return

                new_session = boto3.Session(
                    aws_access_key_id=credentials["AccessKeyId"],
                    aws_secret_access_key=credentials["SecretAccessKey"],
                    aws_session_token=credentials["SessionToken"],
                    region_name=region
                )
                
                if stop_event.is_set():
                    return
                
                pending_tasks.increment()
                executor.submit(
                    assumed_role_enum_task,
                    envData,
                    reScanEnvEntities,
                    role_list,
                    role_arn,
                    arn_list,
                    stop_event,
                    new_session,
                    path + [role_arn],
                    region,
                    executor,
                    pending_tasks,
                    processed
                )
            except Exception as e:
                logging.error(f"[AssumedRole failed] : {current_arn} → {role_arn}: {e}")
                if stop_event.is_set():
                    return

        if "/role/" in current_arn:
            processed.add(current_arn)
    finally:
        pending_tasks.decrement()
        if stop_event.is_set():
            return

def assume_roles_enumeration(envData, reScanEnvEntities, sts_caller_identity_list, session_list, accountDir, stop_event, region="us-east-1"):
    processed = ProcessedTracker()
    pending_tasks = PendingTasks()

    role_list = deepcopy(envData.roles)
    arn_list = deepcopy(envData.arns)

    importlib.reload(resources.threads_config)
    with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as executor:
        for arn, client in zip(arn_list, session_list):
            pending_tasks.increment()
            executor.submit(
                assumed_role_enum_task,
                envData,
                reScanEnvEntities,
                role_list,
                arn,
                arn_list,
                stop_event,
                client,
                [arn],
                region,
                executor,
                pending_tasks,
                processed
            )

        pending_tasks.wait_zero()

    if stop_event.is_set():
        with envData.all_context() as envAll:
            if envAll:
                for iam_result in envAll:
                    for identity in sts_caller_identity_list:
                        if identity['UserName'] == iam_result['UserName']:
                            iam_result['AccessKey'] = identity['AccessKey']
                            file_name = f"scanningOutputCredentialSet_{identity['AccessKey']}.json"
                            save_output_to_file(remove_metadata(iam_result), accountDir, file_name)