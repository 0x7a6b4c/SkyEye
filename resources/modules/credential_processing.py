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

import logging, threading
from copy import deepcopy
from . import (envIAMData, remove_metadata, save_output_to_file, 
               getAccountAuthorizationDetailsEnum, getAccountAuthorizationDetailsEnumCross, 
               assume_roles_enumeration, enumerateEnvEntities)

def process_credential_set(session, sts_caller_identity, output_folder):
    """Process a single credential set and save the output."""
    logging.info(f"Processing credentials set {sts_caller_identity['AccessKey']}...")
    iam_client = session.client("iam")
    envData = envIAMData()
    try:
        output = getAccountAuthorizationDetailsEnum(iam_client, sts_caller_identity, envData)
    except Exception as e:
        logging.error(f"Error processing credentials set {sts_caller_identity['AccessKey']}: {e}", exc_info=True)
    else:
        logging.info(f"Enumeration completed for provided credentials set {sts_caller_identity['AccessKey']}.")
        if envData.all:
            logging.info(f"Identified get_account_authorization_details permissions at [{sts_caller_identity['Arn']}]!")
            file_name = f"scanningOutputCredentialSet_{sts_caller_identity['AccessKey']}.json"
            save_output_to_file(remove_metadata(envData.all[0]), output_folder, file_name)
        else:
            # Transitive Cross-Role Enumeration Model - Run 1
            reScanEnvEntities = enumerateEnvEntities(envData, "assumed-role")
            if envData.roles:
                if reScanEnvEntities.get("Users") or reScanEnvEntities.get("Groups") or reScanEnvEntities.get("Roles") or reScanEnvEntities.get("Policies"):
                    stop_event = threading.Event()
                    if reScanEnvEntities.get("Users"):
                        logging.info("Identified missing IAM component at ['User'] entity level!")
                    if reScanEnvEntities.get("Groups"):
                        logging.info("Identified missing IAM component at ['Group'] entity level!")
                    if reScanEnvEntities.get("Roles"):
                        logging.info("Identified missing IAM component at ['Role'] entity level!")
                    if reScanEnvEntities.get("Policies"):
                        logging.info("Identified missing IAM component at ['Policy'] entity level!")
                    logging.info("Attempting to intialize IAM [AssumedRole] transitive cross-role enumeration model to complement...")
                    assume_roles_enumeration(envData, reScanEnvEntities, [sts_caller_identity], [session], output_folder, stop_event)
            # Transitive Cross-Role Enumeration Model - Re-run 2
            reScanEnvEntities = enumerateEnvEntities(envData, "assumed-role")
            if envData.roles:
                if reScanEnvEntities.get("Users") or reScanEnvEntities.get("Groups") or reScanEnvEntities.get("Roles") or reScanEnvEntities.get("Policies"):
                    stop_event = threading.Event()
                    logging.info("Attempting to re-initialize IAM [AssumedRole] transitive cross-role enumeration model to complement...")
                    logging.disable(logging.INFO)
                    assume_roles_enumeration(envData, reScanEnvEntities, [sts_caller_identity], [session], output_folder, stop_event)
                    logging.disable(logging.NOTSET)
            # Transitive Cross-Role Enumeration Model - Re-run 3
            reScanEnvEntities = enumerateEnvEntities(envData, "assumed-role")
            if envData.roles:
                if reScanEnvEntities.get("Users") or reScanEnvEntities.get("Groups") or reScanEnvEntities.get("Roles") or reScanEnvEntities.get("Policies"):
                    stop_event = threading.Event()
                    logging.info("Attempting to re-initialize IAM [AssumedRole] transitive cross-role enumeration model to complement...")
                    logging.disable(logging.INFO)
                    assume_roles_enumeration(envData, reScanEnvEntities, [sts_caller_identity], [session], output_folder, stop_event)
                    logging.disable(logging.NOTSET)
            if not envData.all:
                final_output = deepcopy(envData.users[0])
                final_output['GroupList'] = deepcopy(envData.groups)
                final_output['RoleList'] = deepcopy(envData.roles)
                file_name = f"scanningOutputCredentialSet_{sts_caller_identity['AccessKey']}.json"
                save_output_to_file(remove_metadata(output), output_folder, file_name)

def process_credential_set_cross(session, sts_caller_identity, sts_caller_identity_list, output_folder, stop_event, envData, mode="default"):
    iam_client = session.client("iam")
    if stop_event.is_set():
        return
    if mode == "default":
        logging.info(f"Processing credentials set {sts_caller_identity['AccessKey']}...")
    target_user_arns = deepcopy(envData.arns)
    try:
        output = getAccountAuthorizationDetailsEnumCross(iam_client, sts_caller_identity, target_user_arns, stop_event, envData, mode)
    except Exception as e:
        logging.error(f"Error processing credentials set {sts_caller_identity['AccessKey']}: {e}", exc_info=True)
    else:
        if stop_event.is_set():
            return
        if mode == "extract":
            logging.info(f"Enumeration completed for provided credentials set {sts_caller_identity['AccessKey']}.")
        with envData.all_context() as envAll:
            if envAll:
                logging.info(f"Identified get_account_authorization_details permissions at [{sts_caller_identity['Arn']}]!")
                for iam_result in envAll:
                    for identity in sts_caller_identity_list:
                        if identity['UserName'] == iam_result['UserName']:
                            iam_result['AccessKey'] = identity['AccessKey']
                            file_name = f"scanningOutputCredentialSet_{identity['AccessKey']}.json"
                            save_output_to_file(remove_metadata(iam_result), output_folder, file_name)
                logging.info("Terminating all threads!")
                stop_event.set()
            else:
                if mode == "extract":
                    file_name = f"scanningOutputCredentialSet_{sts_caller_identity['AccessKey']}.json"
                    save_output_to_file(remove_metadata(output), output_folder, file_name)