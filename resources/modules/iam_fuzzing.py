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

import boto3, threading, importlib, logging
from botocore.client import Config
from concurrent.futures import ThreadPoolExecutor, as_completed
import resources.threads_config
from . import IAM_BOTO3_READ_OPERATION_LIST, createDir, save_output_to_file

CLIENT_SESSION_POOL = {}
CLIENT_SESSION_POOL_LOCK = threading.Lock()

def client_generation(service_name, region, credentials):
    key = f"{service_name}-{region}"
    client = CLIENT_SESSION_POOL.get(key)
    if client:
        return client
    
    with CLIENT_SESSION_POOL_LOCK:
        client = CLIENT_SESSION_POOL.get(key)
        if client:
            return client
        
        config = Config(
            connect_timeout=5,
            read_timeout=5,
            retries={'max_attempts': 3},
            max_pool_connections=50
        )
        client = boto3.client(
            service_name,
            region_name=region,
            config=config,
            **credentials
        )
        CLIENT_SESSION_POOL[key] = client
    return client

def perm_validation(credentials, region, services, operations):
    try:
        client = client_generation(services, region, credentials)
        action_function = getattr(client, operations)
        action_function()
        return services, operations, True
    except Exception as e:
        return services, operations, False

def args_generation(access_key, secret_key, session_token, region):
    credentials = {
        'aws_access_key_id': access_key,
        'aws_secret_access_key': secret_key,
        'aws_session_token': session_token
    }
    for service_name, operations in IAM_BOTO3_READ_OPERATION_LIST.items():
        for operation in operations:
            yield (credentials, region, service_name, operation)

def format_case(operations):
    components = operations.split('_')
    return components[0].title() + ''.join(x.title() for x in components[1:])

def iam_permission_fuzzing(credentials, output_folder):
    logging.info("Initializing [iam-fuzzing] scanninng mode...")
    output = {}
    sts_client = boto3.client(
        aws_access_key_id=credentials['AccessKey'],
        aws_secret_access_key=credentials['SecretKey'],
        aws_session_token=credentials.get('SessionToken', ''),
        region_name=credentials.get('Region', 'us-east-1'),
        service_name="sts"
    )
    sts_caller_identity = sts_client.get_caller_identity()
    accountDir = createDir(output_folder, sts_caller_identity['Account'])
    args = list(args_generation(credentials['AccessKey'], credentials['SecretKey'], credentials.get('SessionToken', ''), credentials.get('Region', 'us-east-1')))
    
    importlib.reload(resources.threads_config)
    with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as executor:
        futures = [executor.submit(perm_validation, *arg) for arg in args]
        
        for future in as_completed(futures):
            service, operation, result = future.result()
            if result:
                if service not in output:
                    output[service] = list()
                output[service].append(format_case(operation))
    
    save_output_to_file(output, accountDir, f"fuzzingOutputCredentialSet_{credentials['AccessKey']}.json")