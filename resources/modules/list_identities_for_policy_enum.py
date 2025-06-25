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

import botocore, json, importlib
from copy import deepcopy
from concurrent.futures import ThreadPoolExecutor, as_completed
from . import remove_metadata, version_checking, statement_filterings

# ListEntitiesForPolicy
# with envData.users_context() as envUsers:
#     for user in envUsers:
#         user['AttachedManagedPolicies'] = user.get("AttachedManagedPolicies", [])
# with envData.groups_context() as envGroups:
#     for group in envGroups:
#         group['AttachedManagedPolicies'] = group.get("AttachedManagedPolicies", [])
# with envData.roles_context() as envRoles:
#     for role in envRoles:
#         role['AttachedManagedPolicies'] = role.get("AttachedManagedPolicies", [])

def populateAMPforPoliciesAllCase(envData):
    with envData.users_context() as envUsers:
        for user in envUsers:
            user['AttachedManagedPolicies'] = user.get("AttachedManagedPolicies", [])
            for group in user['GroupList']:
                group['AttachedManagedPolicies'] = group.get("AttachedManagedPolicies", [])
            for role in user['RoleList']:
                role['AttachedManagedPolicies'] = role.get("AttachedManagedPolicies", [])

def filteringListEntitiesForPolicy(envUsers, envGroups, envRoles):
    envPolicies = []
    reScanArnPolicies = {
        "Users":[],
        "Groups":[],
        "Roles":[]
    }
    for index, user in enumerate(envUsers):
        if user.get("AttachedManagedPolicies") is None:
            reScanArnPolicies['Users'].append({"Name":user['UserName'],"Index":index})
        else:
            envPolicies.extend(user['AttachedManagedPolicies'])
    for index, group in enumerate(envGroups):
        if group.get("AttachedManagedPolicies") is None:
            reScanArnPolicies['Groups'].append({"Name":group['GroupName'],"Index":index})
        else:
            envPolicies.extend(group['AttachedManagedPolicies'])
    for index, role in enumerate(envRoles):
        if role.get("AttachedManagedPolicies") is None:
            reScanArnPolicies['Roles'].append({"Name":role['RoleName'],"Index":index})
        else:
            envPolicies.extend(role['AttachedManagedPolicies'])
    envUniquePolicies = list({policy["PolicyName"]: policy for policy in envPolicies}.values())
    return envUniquePolicies, reScanArnPolicies

def checkingLEFPPermission(iam_client):
    try:
        checkCondition = iam_client.list_entities_for_policy(PolicyArn="arn:aws:iam::aws:policy/SkyEye")
    except botocore.exceptions.ClientError as error:
        if error.response['Error']['Code'] == 'NoSuchEntity':
            return True
        else:
            return False
    else:
        return True
        
def listEntitiesForPolicy(iam_client, policy_arn):
    try:
        entities = iam_client.list_entities_for_policy(PolicyArn=policy_arn)
    except botocore.exceptions.ClientError as error:
        return None
    else:
        entities = {"PolicyUsers": [user["UserName"] for user in entities["PolicyUsers"]],
                    "PolicyGroups": [group["GroupName"] for group in entities["PolicyGroups"]],
                    "PolicyRoles": [role["RoleName"] for role in entities["PolicyRoles"]]}
        return entities
    
def versionToStatement(iam_client, policy, envData):
    if policy['PolicyArn'].split(':')[4] == "aws":
        try:
            f = open(f"policies/{policy['PolicyName']}.json", "r")
        except:
            pass
        else:
            result = json.loads(f.read())
            policy['Statement'] = statement_filterings(result['Statement'])
    else:
        with envData.policies_context() as envPolicies:
            env_policy_names = {policy['PolicyName'] for policy in envPolicies}
            if policy['PolicyName'] in env_policy_names:
                for envPolicy in envPolicies:
                    if envPolicy['PolicyName'] == policy['PolicyName']:
                        # policy = policy | envPolicy
                        # envPolicy = policy | envPolicy
                        policy.update(envPolicy)
                        break
            else:
                try:
                    response = iam_client.get_policy_version(
                        PolicyArn=policy['PolicyArn'],
                        VersionId=policy['DefaultVersionId']
                    )
                except botocore.exceptions.ClientError as error:
                    pass
                else:
                    policy['Statement'] = statement_filterings(remove_metadata(response['PolicyVersion']['Document']['Statement']))
                    policy = version_checking(policy, iam_client)
                    envPolicies.append(policy)
    return policy
    
def scanningListEntitiesForPolicyCoreStatement(iam_client, entities, reScanNamePolicies, policy, envData, mode, core_mode):
    for entity in reScanNamePolicies[f"{core_mode}"]:
        if entity['Name'] in entities[f"Policy{core_mode}"]:
            if mode == "newScan":
                policy = versionToStatement(iam_client, policy, envData)
            if core_mode == "Users":
                with envData.users_context() as envUsers:
                    envUsers[entity['Index']]['AttachedManagedPolicies'] = envUsers[entity['Index']].get('AttachedManagedPolicies',[]) + [policy]
            if core_mode == "Groups":
                with envData.groups_context() as envGroups:
                    envGroups[entity['Index']]['AttachedManagedPolicies'] = envGroups[entity['Index']].get('AttachedManagedPolicies',[]) + [policy]
            if core_mode == "Roles":
                with envData.roles_context() as envRoles:
                    envRoles[entity['Index']]['AttachedManagedPolicies'] = envRoles[entity['Index']].get('AttachedManagedPolicies',[]) + [policy]
    
def scanningListEntitiesForPolicyCore(iam_client, reScanNamePolicies, policy, envData, mode):
    entities = listEntitiesForPolicy(iam_client, policy['PolicyArn'])
    if entities:
        if entities.get("PolicyUsers", []):
            scanningListEntitiesForPolicyCoreStatement(iam_client, entities, reScanNamePolicies, policy, envData, mode, "Users")
        if entities.get("PolicyGroups", []):
            scanningListEntitiesForPolicyCoreStatement(iam_client, entities, reScanNamePolicies, policy, envData, mode, "Groups")
        if entities.get("PolicyRoles", []):
            scanningListEntitiesForPolicyCoreStatement(iam_client, entities, reScanNamePolicies, policy, envData, mode, "Roles")

def scanningListEntitiesForPolicy(iam_client, reScanNamePolicies, AWS_POLICIES, envData):
    keys_to_exclude = ["PolicyId","Path","AttachmentCount","PermissionsBoundaryUsageCount","IsAttachable","CreateDate","UpdateDate"]
    envPoliciesAll = deepcopy(envData.policiesAll)
    if envPoliciesAll:
        for policy in envPoliciesAll:
            scanningListEntitiesForPolicyCore(iam_client, reScanNamePolicies, policy, envData, "newScan")
    else:
        try:
            policies = iam_client.list_policies(Scope='All', OnlyAttached=True, PolicyUsageFilter='PermissionsPolicy')['Policies']
        except botocore.exceptions.ClientError as error:
            acquired_policies = deepcopy(envData.policies)
            for policy in acquired_policies[:]:
                if "aws" == policy['PolicyArn'].split(':')[4]:
                    acquired_policies.remove(policy)

            for policy in acquired_policies:
                scanningListEntitiesForPolicyCore(iam_client, reScanNamePolicies, policy, envData, "reScan")
        
            with ThreadPoolExecutor(max_workers=10) as sub_executor:
                futures = [
                    sub_executor.submit(scanningListEntitiesForPolicyCore, 
                        iam_client, 
                        reScanNamePolicies,
                        policy,
                        envData,
                        "newScan"        
                    )
                    for policy in AWS_POLICIES
                ]
                for future in as_completed(futures):
                    future.result()
        else:
            for policy in policies[:]:
                for removed_key in keys_to_exclude:
                    del policy[removed_key]
                policy['PolicyArn'] = policy.pop('Arn')
                scanningListEntitiesForPolicyCore(iam_client, reScanNamePolicies, policy, envData, "newScan")