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

import threading, logging, importlib
from concurrent.futures import ThreadPoolExecutor, as_completed
import resources.threads_config
from . import (envIAMData, AWS_POLICIES, createDir, 
               session_list_generation, process_credential_set_cross, 
               filteringListIdentitiesForPolicy, checkingLIFPPermission, scanningListIdentitiesForPolicy, 
               enumerateEnvEntities, envEntitiesComplement, assume_roles_enumeration)

def multiAccountThreading(output_folder, account_id, credential_list):
    envData = envIAMData()
    stop_event = threading.Event()
    accountDir = createDir(output_folder, account_id)
    session_list, sts_caller_identity_list = session_list_generation(credential_list)

    with envData.arns_context() as arns_list:
        for sts_caller_identity in sts_caller_identity_list:
            arns_list.append(sts_caller_identity['Arn'])

    importlib.reload(resources.threads_config)
    
    # process_credential_set_cross ("default")
    logging.info("Attempting to initialize IAM cross-principal scanning model across multiple users...")
    with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as sub_executor:
        futures = [
            sub_executor.submit(
                process_credential_set_cross,
                session_list[index],
                sts_caller_identity,
                sts_caller_identity_list,
                accountDir,
                stop_event,
                envData,
                "default"
            )
            for index, sts_caller_identity in enumerate(sts_caller_identity_list)
            if not stop_event.is_set()
        ]
        for future in as_completed(futures):
            if stop_event.is_set():
                sub_executor.shutdown(wait=False)
                break
            future.result()
    if stop_event.is_set():
        return

    # Re-scan environment entities
    reScanEnvEntities = enumerateEnvEntities(envData)
    if not stop_event.is_set():
        if reScanEnvEntities.get("Users") or reScanEnvEntities.get("Groups") or reScanEnvEntities.get("Roles") or reScanEnvEntities.get("Policies"):
            if reScanEnvEntities.get("Users"):
                logging.info("Identified missing IAM component at ['User'] entity level!")
            if reScanEnvEntities.get("Groups"):
                logging.info("Identified missing IAM component at ['Group'] entity level!")
            if reScanEnvEntities.get("Roles"):
                logging.info("Identified missing IAM component at ['Role'] entity level!")
            if reScanEnvEntities.get("Policies"):
                logging.info("Identified missing IAM component at ['Policy'] entity level!")
            logging.info("Attempting to re-initialize IAM cross-principal scanning model to complement...")
            with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as sub_executor:
                futures = [
                    sub_executor.submit(envEntitiesComplement, 
                        session, 
                        reScanEnvEntities,
                        envData
                    )
                    for session in session_list
                ]
                for future in as_completed(futures):
                    if stop_event.is_set():
                        sub_executor.shutdown(wait=False)
                        break
                    future.result()
            if stop_event.is_set():
                return
            logging.info("Completed IAM cross-principal scanning model!")
    
    # Re-scan by Reverse Approach - ListIdentitiesForPolicy - ListPolicies
    envPolicies, reScanNamePolicies = filteringListIdentitiesForPolicy(envData.users, envData.groups, envData.roles)
    if reScanNamePolicies.get("Users") or reScanNamePolicies.get("Groups") or reScanNamePolicies.get("Roles"):
        condition_LIFP = False
        for session in session_list:
            if checkingLIFPPermission(session.client('iam')):
                condition_LIFP = True
        if condition_LIFP and not stop_event.is_set():
            if reScanNamePolicies.get("Users"):
                logging.info("Identified missing IAM AttachedManagedPolicies component at ['User'] entity level!")
            if reScanNamePolicies.get("Groups"):
                logging.info("Identified missing IAM AttachedManagedPolicies component at ['Group'] entity level!")
            if reScanNamePolicies.get("Roles"):
                logging.info("Identified missing IAM AttachedManagedPolicies component at ['Role'] entity level!")
            logging.info("Identified permitted [ListIdentityForPolicies] action!")
            logging.info("Attempting to initialize IAM [ListPolicies / ListIdentityForPolicies] method to complement...")
            if not stop_event.is_set():
                with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as sub_executor:
                    futures = [
                        sub_executor.submit(scanningListIdentitiesForPolicy,
                            session.client("iam"),
                            reScanNamePolicies,
                            AWS_POLICIES,
                            envData
                        )
                        for session in session_list
                    ]
                    for future in as_completed(futures):
                        if stop_event.is_set():
                            sub_executor.shutdown(wait=False)
                            break
                        future.result()
                if stop_event.is_set():
                    return
            logging.info("Completed IAM [ListPolicies / ListIdentityForPolicies] method !")

    # Re-initialize cross-principal scanning model  
    logging.info("Attempting to re-intialize IAM cross-principal scanning model across multiple users...")
    logging.disable(logging.INFO)
    with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as sub_executor:
        futures = [
            sub_executor.submit(
                process_credential_set_cross,
                session_list[index],
                sts_caller_identity,
                sts_caller_identity_list,
                accountDir,
                stop_event,
                envData,
                "default"
            )
            for index, sts_caller_identity in enumerate(sts_caller_identity_list)
            if not stop_event.is_set()
        ]
        for future in as_completed(futures):
            if stop_event.is_set():
                sub_executor.shutdown(wait=False)
                break
            future.result()
    logging.disable(logging.NOTSET)
    if stop_event.is_set():
        return

    # Re-scan by rotating through Roles to perform AssumeRole and cross-principal Scanning Model
    reScanEnvEntities = enumerateEnvEntities(envData, "assumed-role")
    if not stop_event.is_set():
        if reScanEnvEntities.get("Users") or reScanEnvEntities.get("Groups") or reScanEnvEntities.get("Roles") or reScanEnvEntities.get("Policies"):
            if reScanEnvEntities.get("Users"):
                logging.info("Identified missing IAM component at ['User'] entity level!")
            if reScanEnvEntities.get("Groups"):
                logging.info("Identified missing IAM component at ['Group'] entity level!")
            if reScanEnvEntities.get("Roles"):
                logging.info("Identified missing IAM component at ['Role'] entity level!")
            if reScanEnvEntities.get("Policies"):
                logging.info("Identified missing IAM component at ['Policy'] entity level!")
            logging.info("Attempting to initialize IAM [AssumedRole] transitive cross-role enumeration model to complement...")
            if not stop_event.is_set():
                assume_roles_enumeration(envData, reScanEnvEntities, sts_caller_identity_list, session_list, accountDir, stop_event)
    
    reScanEnvEntities = enumerateEnvEntities(envData)
    if not stop_event.is_set():
        if reScanEnvEntities.get("Users") or reScanEnvEntities.get("Groups") or reScanEnvEntities.get("Roles") or reScanEnvEntities.get("Policies"):
            with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as sub_executor:
                futures = [
                    sub_executor.submit(envEntitiesComplement, 
                        session, 
                        reScanEnvEntities,
                        envData
                    )
                    for session in session_list
                ]
                for future in as_completed(futures):
                    if stop_event.is_set():
                        sub_executor.shutdown(wait=False)
                        break
                    future.result()
            if stop_event.is_set():
                return

    reScanEnvEntities = enumerateEnvEntities(envData, "assumed-role")
    if not stop_event.is_set():
        if reScanEnvEntities.get("Users") or reScanEnvEntities.get("Groups") or reScanEnvEntities.get("Roles") or reScanEnvEntities.get("Policies"):
            logging.info("Attempting to re-initialize IAM [AssumedRole] transitive cross-role enumeration model to complement...")
            if not stop_event.is_set():
                logging.disable(logging.INFO)
                assume_roles_enumeration(envData, reScanEnvEntities, sts_caller_identity_list, session_list, accountDir, stop_event)
                logging.disable(logging.NOTSET)
    
    # process_credential_set_cross ("extract")
    with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as sub_executor:
        futures = [
            sub_executor.submit(
                process_credential_set_cross,
                session_list[index],
                sts_caller_identity,
                sts_caller_identity_list,
                accountDir,
                stop_event,
                envData,
                "extract"
            )
            for index, sts_caller_identity in enumerate(sts_caller_identity_list)
            if not stop_event.is_set()
        ]
        for future in as_completed(futures):
            if stop_event.is_set():
                sub_executor.shutdown(wait=False)
                break
            future.result()
    if stop_event.is_set():
        return