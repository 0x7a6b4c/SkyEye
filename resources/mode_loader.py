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

import logging, importlib
from concurrent.futures import ThreadPoolExecutor, as_completed
import resources.threads_config
from .modules import (createDir, session_list_generation, get_unique_access_keys, process_credential_set, account_filterings, multiAccountThreading)


def singleUserSeparationMode(credentials_list, output_folder, mode="default"):
    if mode == "single-entity":
        logging.info("Initializing [single-entity] scanninng mode...")
    else:
        logging.info("Initializing [separate-entity] scanninng mode...")
    
    credentials_list = get_unique_access_keys(credentials_list)
    session_list, sts_caller_identity_list = session_list_generation(credentials_list)
    importlib.reload(resources.threads_config)
    with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as executor:
        futures = []
        for index, sts_caller_identity in enumerate(sts_caller_identity_list):
            accountDir = createDir(output_folder, sts_caller_identity['Account'])
            future = executor.submit(
                process_credential_set,
                session_list[index],
                sts_caller_identity,
                accountDir
            )
            futures.append(future)
        
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                logging.error(f"Error processing credentials set: {e}", exc_info=True)

def multipleUserCrossMode(credentials_list, output_folder):
    logging.info("Initializing [cross-entity] scanninng mode...")
    filteredCredentialList = account_filterings(credentials_list)
    if not filteredCredentialList:
        singleUserSeparationMode(credentials_list, output_folder)
    else:
        importlib.reload(resources.threads_config)
        with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as account_executor:
            futures = []
            for account_id, credential_list in filteredCredentialList.items():
                if len(credential_list) > 1:
                    futures.append(
                        account_executor.submit(
                            multiAccountThreading,
                            output_folder,
                            account_id,
                            credential_list,
                        )
                    )
                else:
                    session_list, sts_caller_identity_list = session_list_generation(credential_list)
                    accountDir = createDir(output_folder, sts_caller_identity_list[0]['Account'])
                    futures.append(
                        account_executor.submit(
                            process_credential_set,
                            session_list[0],
                            sts_caller_identity_list[0],
                            accountDir
                        )
                    )
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    logging.error(f"Error processing credentials set: {e}", exc_info=True)