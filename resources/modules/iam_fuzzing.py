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

import boto3, threading, importlib, logging, json, time, botocore
from functools import partial
from collections import defaultdict
from botocore.client import Config
from concurrent.futures import ThreadPoolExecutor, as_completed
import resources.threads_config
from . import IAM_BOTO3_READ_OPERATION_LIST, IAM_OPERATION_LIST, AWS_POLICY_DICT, createDir, save_output_to_file, remove_metadata, statement_filterings, filter_roles_by_principal

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

    sts_client = boto3.client(
        'sts',
        aws_access_key_id=credentials['AccessKey'],
        aws_secret_access_key=credentials['SecretKey'],
        aws_session_token=credentials.get('SessionToken', ''),
        region_name=credentials.get('Region', 'us-east-1'),
    )

    try:
        sts_caller_identity = sts_client.get_caller_identity()
    except botocore.exceptions.ClientError as error:
        return
    else:
        sts_caller_identity = remove_metadata(sts_client.get_caller_identity())
        sts_caller_identity['AccessKey'] = credentials['AccessKey']
        sts_caller_identity['UserName'] = sts_caller_identity['Arn'].split('/')[-1]
    
    accountDir = createDir(output_folder, sts_caller_identity['Account'])

    # [iam:SimulatePrincipalPolicy]
    logging.info("Initializing [iam:SimulatePrincipalPolicy] permissions simulation mode...")
    output = simulate_principal_policy(credentials, sts_caller_identity)
    if output:
        save_output_to_file(output, accountDir, f"fuzzingOutputCredentialSet_{credentials['AccessKey']}.json")
    else:
        logging.info("[iam:SimulatePrincipalPolicy] - Access Denied!")
        # [IAM Fuzzing]
        output = {}
        logging.info("Initializing [IAM] fuzzing mode...")
        args = list(args_generation(credentials['AccessKey'], credentials['SecretKey'], credentials.get('SessionToken', ''), credentials.get('Region', 'us-east-1')))
        importlib.reload(resources.threads_config)
        with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as executor:
            futures = [executor.submit(perm_validation, *arg) for arg in args]
            for future in as_completed(futures):
                service, operation, result = future.result()
                if result:
                    if service not in output:
                        output[service] = list()
                    output[service].append(f"{service}:{format_case(operation)}")
        
        final_output = {
            "IAMFuzzing_Technique": {
                "UserName": sts_caller_identity['UserName'],
                "Arn": sts_caller_identity['Arn'],
                "AccessKey": sts_caller_identity['AccessKey'],
                "Account": sts_caller_identity['Account'],
                "Action": output
            }
        }
        save_output_to_file(final_output, accountDir, f"fuzzingOutputCredentialSet_{credentials['AccessKey']}.json")

def process_batch(iam_client, arn, batch_num, action_batch, max_retries=5):
    retry_count = 0
    last_error = None
    
    while retry_count < max_retries:
        try:
            response = iam_client.simulate_principal_policy(
                PolicySourceArn=arn,
                ActionNames=action_batch
            )
            return {
                "batch_num": batch_num,
                "result": remove_metadata(response),
                "success": True
            }
        except botocore.exceptions.ClientError as error:
            last_error = str(error)
            retry_count += 1
            if retry_count < max_retries:
                wait_time = 2 ** retry_count
                logging.error(f"Retry {retry_count} for batch {batch_num} after {wait_time} seconds...")
                time.sleep(wait_time)
    
    return {
        "batch_num": batch_num,
        "error": last_error,
        "success": False,
        "actions": action_batch
    }

def group_by_policy_id(data):
    """Group actions and resources by PolicyId."""
    result = defaultdict(lambda: {"Action": set(), "Resource": set()})
    
    for item in data:
        action = item["Action"]
        resource = item["Resource"]
        
        for policy_id in item["PolicyId"]:
            result[policy_id]["Action"].add(action)
            result[policy_id]["Resource"].add(resource)
    
    # Convert sets to lists for the final output
    return {k: {"Action": list(v["Action"]), "Resource": list(v["Resource"])} 
            for k, v in result.items()}

def get_aws_policy(structured_result, key, data):
    if AWS_POLICY_DICT.get(key):
        aws_managed_policy = AWS_POLICY_DICT.get(key)
        try:
            f = open(f"policies/{key}.json", "r")
        except:
            pass
        else:
            result = json.loads(f.read())
            aws_managed_policy['DefaultVersionId'] = result['DefaultVersionId']
            aws_managed_policy['Statement'] = statement_filterings(result['Statement'])
            aws_managed_policy['Statement'] = result['Statement']
        structured_result['AttachedManagedPolicies'].append(aws_managed_policy)
    else:
        structured_result['AttachedManagedPolicies'].append(
            {
                "PolicyName": key,
                "Action": data.get("Action", []),
                "Resource": data.get("Resource", [])
            }
        )
    return structured_result

def structuring_result(grouped_results, mode):
    if mode == "default":
        structured_result = {
            "UserInlinePolicies":[],
            "GroupInlinePolicies":[],
            "AttachedManagedPolicies":[]
        }
        for key, data in grouped_results.items():
            if key.startswith(("user_")):
                structured_result['UserInlinePolicies'].append(
                    {
                        "PolicyObjectId": key,
                        "Action": data.get("Action", []),
                        "Resource": data.get("Resource", [])
                    }
                )
            elif key.startswith(("group_")):
                structured_result['GroupInlinePolicies'].append(
                    {
                        "PolicyObjectId": key,
                        "Action": data.get("Action", []),
                        "Resource": data.get("Resource", [])
                    }
                )
            else:
                structured_result = get_aws_policy(structured_result, key, data)
    else:
        structured_result = {
            "RoleInlinePolicies":[],
            "AttachedManagedPolicies":[]
        }
        for key, data in grouped_results.items():
            if key.startswith(("role_")):
                structured_result['RoleInlinePolicies'].append(
                    {
                        "PolicyObjectId": key,
                        "Action": data.get("Action", []),
                        "Resource": data.get("Resource", [])
                    }
                )
            else:
                structured_result = get_aws_policy(structured_result, key, data)
    return structured_result

def filter_allowed_actions(all_results, mode="default"):
    filtered_results = []
    
    for batch_key, batch_data in all_results.items():
        if not isinstance(batch_data, dict) or "EvaluationResults" not in batch_data:
            continue
            
        for evaluation in batch_data["EvaluationResults"]:
            if evaluation.get("EvalDecision") == "allowed":
                filtered_entry = {
                    "Action": evaluation["EvalActionName"],
                    "Resource": evaluation["EvalResourceName"],
                    "PolicyId": []
                }
                if evaluation.get("MatchedStatements"):
                    for matchedstatement in evaluation['MatchedStatements']:
                        filtered_entry["PolicyId"].append(matchedstatement.get("SourcePolicyId"))
                
                filtered_results.append(filtered_entry)
    
    filtered_results.sort(key=lambda x: x["Action"])

    grouped_results = group_by_policy_id(filtered_results)
    
    structured_results = structuring_result(grouped_results, mode)

    return structured_results

def core_simulate_principal_policy(iam_client, arn, max_workers=10, batch_size=100):
    all_results = {}
    failed_batches = []
    
    # Prepare batches
    batches = []
    for i in range(0, len(IAM_OPERATION_LIST), batch_size):
        batch_num = (i // batch_size) + 1
        action_batch = IAM_OPERATION_LIST[i:i + batch_size]
        batches.append((batch_num, action_batch))
    
    # Process batches
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        process_func = partial(process_batch, iam_client, arn)
        future_to_batch = {
            executor.submit(process_func, batch_num, action_batch): batch_num
            for batch_num, action_batch in batches
        }
        
        for future in as_completed(future_to_batch):
            batch_num = future_to_batch[future]
            try:
                result = future.result()
                if result['success']:
                    all_results[f"batch_{batch_num}"] = result['result']
                else:
                    all_results[f"batch_{batch_num}"] = {"error": result['error']}
                    failed_batches.append((batch_num, result['actions']))
                logging.info(f"Completed batch {batch_num} - {'Success' if result['success'] else 'Failed'}")
            except Exception as e:
                logging.error(f"Unexpected error processing batch {batch_num}: {str(e)}")
                all_results[f"batch_{batch_num}"] = {"error": str(e)}
    
    # Retry failed batches
    if failed_batches:
        logging.error(f"Retrying {len(failed_batches)} failed batches sequentially...")
        for batch_num, action_batch in failed_batches:
            result = process_batch(iam_client, arn, batch_num, action_batch)
            if result['success']:
                all_results[f"batch_{batch_num}"] = result['result']
            else:
                all_results[f"batch_{batch_num}"] = {"error": result['error']}
    
    return all_results

def simulate_principal_policy(cred, sts_caller_identity):
    boto_config = Config(
        retries={
            'max_attempts': 10,
            'mode': 'standard'
        }
    )
    iam_client = boto3.client(
        'iam',
        aws_access_key_id=cred['AccessKey'],
        aws_secret_access_key=cred['SecretKey'],
        aws_session_token=cred.get('SessionToken', ''),
        region_name=cred.get('Region', 'us-east-1'),
        config=boto_config
    )

    try:
        iam_client.simulate_principal_policy(
            PolicySourceArn=sts_caller_identity['Arn'],
            ActionNames=['sts:GetCallerIdentity']
        )
    except botocore.exceptions.ClientError:
        return None

    
    user_simulation_results = core_simulate_principal_policy(iam_client, sts_caller_identity['Arn'], max_workers=10, batch_size=100)
    
    output = filter_allowed_actions(user_simulation_results)
    output['UserName'] = sts_caller_identity['UserName']
    output['Arn'] = sts_caller_identity['Arn']
    output['AccessKey'] = sts_caller_identity['AccessKey']
    output['Account'] = sts_caller_identity['Account']

    # List Roles and Filter (In-scope IAM Roles)
    policyJson = filter_roles_by_principal(iam_client, output['Arn'], None)
    if policyJson:
        output['RoleList'] = list()
        for role_iam in policyJson:
            role_simulation_results = core_simulate_principal_policy(iam_client, role_iam['Arn'], max_workers=10, batch_size=100)
            role_result = filter_allowed_actions(role_simulation_results, "role")
            role_result['RoleName'] = role_iam['RoleName']
            role_result['Arn'] = role_iam['Arn']
            role_result['AssumeRolePolicyStatement'] = role_iam['AssumeRolePolicyStatement']
            output['RoleList'].append(role_result)
    
    return {
        "SimulatePrincipalPolicy_Technique": output
    }