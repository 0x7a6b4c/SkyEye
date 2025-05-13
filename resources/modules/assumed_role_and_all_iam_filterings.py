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

import json
from . import remove_metadata, json_encoder, version_statement_diff, statement_filterings

def assumeRoleIterationFilter(userArnList, roleListAll, policy_dict=None):
    roleList = list()
    while True:
        if not roleList:
            targetArnList = userArnList
        else:
            targetArnList = [role['Arn'] for role in roleList]
        iRole = dict()
        for role in roleListAll[:]:
            for statement in role['AssumeRolePolicyDocument']['Statement']:
                if statement['Effect'] == 'Allow':
                    action = False
                    if isinstance(statement['Action'], list):
                        for statement_action in statement['Action']:
                            if statement_action == "sts:AssumeRole":
                                action = True
                    else:
                        if statement['Action'] == "sts:AssumeRole":
                            action = True
                    if action:
                        for key, value in statement['Principal'].items():
                            if key == "AWS" and (value in targetArnList):
                                if policy_dict:
                                    iRole = filter_roles(json.loads(json.dumps(remove_metadata(role), default=json_encoder)), policy_dict)
                                else:
                                    iRole = {
                                        "RoleName": role["RoleName"],
                                        "RoleId": role["RoleId"],
                                        "Arn": role["Arn"],
                                        "AssumeRolePolicyStatement": role["AssumeRolePolicyDocument"]['Statement']
                                    }
                                roleList.append(iRole)
                                roleListAll.remove(role)
                                break
                        if iRole:
                            break
        if not iRole:
            break
    return roleList

## get_account_authorization_details processing - result

def filter_groups(groupJson, policy_dict):
    group_keys_to_exclude = ["Path", "CreateDate"]
    for removed_keys in group_keys_to_exclude:
        if removed_keys in groupJson:
            del groupJson[removed_keys]
        
    if "GroupPolicyList" in groupJson:
        groupJson["InlinePolicies"] = groupJson.pop("GroupPolicyList")
        for inlinePolicies in groupJson['InlinePolicies']:
            inlinePolicies['Statement'] = statement_filterings(inlinePolicies['PolicyDocument']['Statement'])
            del inlinePolicies['PolicyDocument']

    groupJson['AttachedManagedPolicies'] = all_iam_managedpolicies(groupJson, policy_dict)

    return groupJson

def filter_roles(roleJson, policy_dict):
    role_keys_to_exclude = ["Path", "CreateDate", "InstanceProfileList", "RoleLastUsed", "Tags"]
    for removed_keys in role_keys_to_exclude:
        if removed_keys in roleJson:
            del roleJson[removed_keys]

    roleJson['AssumeRolePolicyDocument'] = roleJson['AssumeRolePolicyDocument']['Statement']
    
    if "RolePolicyList" in roleJson:
        roleJson["InlinePolicies"] = roleJson.pop("RolePolicyList")
        for inlinePolicies in roleJson['InlinePolicies']:
            inlinePolicies['Statement'] = statement_filterings(inlinePolicies['PolicyDocument']['Statement'])
            del inlinePolicies['PolicyDocument']

    roleJson['AttachedManagedPolicies'] = all_iam_managedpolicies(roleJson, policy_dict)

    return roleJson

def filter_policies(policies):
    filtered_policies = []
    for policy in policies["Policies"]:
        if not policy["Arn"].startswith("arn:aws:iam::aws:policy") and policy["Path"] == "/":
            filtered_policies.append(policy)
    return filtered_policies

def all_iam_managedpolicies(entity, policy_dict):
    if entity.get('AttachedManagedPolicies') is not None:
        response = []
        for managedPolicy in entity['AttachedManagedPolicies']:
            allResult = policy_dict.get(managedPolicy['PolicyArn'], None)
            if allResult == None:
                result = dict()
                try:
                    f = open(f"policies/{managedPolicy['PolicyName']}.json", "r")
                except:
                    pass
                else:
                    result = json.loads(f.read())
                    result['Statement'] = statement_filterings(result['Statement'])
            else:
                result = dict()
                result['PolicyName'] = allResult['PolicyName']
                result['PolicyArn'] = allResult['Arn']
                result['DefaultVersionId'] = allResult['DefaultVersionId']
                result['OtherVersionIds'] = list()
                result['Statement'] = list()
                result['Statement'].extend(
                    statement
                    for policy in allResult['PolicyVersionList']
                    if policy["VersionId"] == result['DefaultVersionId']
                    for statement in (
                        policy['Document']['Statement'] if isinstance(policy['Document']['Statement'], list) else [policy['Document']['Statement']]
                    )
                )
                result['Statement'] = statement_filterings(result['Statement'])
                for policy in allResult['PolicyVersionList']:
                    if policy['VersionId'] != result['DefaultVersionId']:
                        result['OtherVersionIds'].append(policy['VersionId'])
                        other_version_statements = statement_filterings(policy['Document']['Statement'])
                        diff_version_statements = version_statement_diff(result['Statement'], other_version_statements, policy['VersionId'])
                        if not result.get("HistoricPolicyVersionDetection", None):
                            result['HistoricPolicyVersionDetection'] = list()
                        result['HistoricPolicyVersionDetection'].append(diff_version_statements)
            response.append(result)
        entity['AttachedManagedPolicies'] = response
    else:
        entity['AttachedManagedPolicies'] = []
    return entity['AttachedManagedPolicies']

def all_iam_json_enum(all_iam):
    keys_to_exclude = ["Path", "CreateDate", "Tags"]
    policy_dict = {policy['Arn']: policy for policy in filter_policies(all_iam)}
    for user in all_iam['UserDetailList']:
        user['Account'] = user['Arn'].split(':')[4]
        for removed_keys in keys_to_exclude:
            del user[removed_keys]
        if user.get('UserPolicyList') is not None:
            user["InlinePolicies"] = user.pop("UserPolicyList")
            for inlinePolicies in user['InlinePolicies']:
                inlinePolicies['Statement'] = statement_filterings(inlinePolicies['PolicyDocument']['Statement'])
                del inlinePolicies['PolicyDocument']
        else:
            user['InlinePolicies'] = []
        
        user['AttachedManagedPolicies'] = all_iam_managedpolicies(user, policy_dict)

        if user['GroupList']:
            response = []
            group_dict = {group['GroupName']: group for group in all_iam['GroupDetailList']}
            for groupJson in user['GroupList']:
                result = filter_groups(json.loads(json.dumps(remove_metadata(group_dict.get(groupJson, {})), default=json_encoder)),policy_dict)
                response.append(result)
            user['GroupList'] = response

        roleResponse = assumeRoleIterationFilter([user['Arn']], all_iam['RoleDetailList'], policy_dict)
        if not roleResponse:
            user['RoleList'] = []
        else:
            user['RoleList'] = roleResponse

    return all_iam['UserDetailList']