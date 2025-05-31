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

from . import (list_inline_policies, list_attached_policies, list_groups_for_user, 
               filter_roles_by_principal, get_inline_policy, get_attached_policies)

def process_iam(iam_client, policy_json, mode, envPolicies=None):
    inline_policy_json = list_inline_policies(iam_client, policy_json[f'{mode.capitalize()}Name'], mode)

    if inline_policy_json:
        policy_json['InlinePolicies'] = inline_policy_json
    
    attached_policy_json = list_attached_policies(iam_client, policy_json[f'{mode.capitalize()}Name'], mode, envPolicies)
    if isinstance(attached_policy_json, list):
        policy_json['AttachedManagedPolicies'] = attached_policy_json

    return policy_json

def list_object_iam(iam_client, policy_json, envPolicies, mode):
    if mode == "user":
        policyJson = process_iam(iam_client, policy_json, mode, envPolicies)
    if mode == "group":
        policyJson = list_groups_for_user(iam_client, policy_json['UserName'], None)
        if isinstance(policyJson, list):
            if policyJson:
                for group_iam in policyJson:
                    group_iam = process_iam(iam_client, group_iam, mode, envPolicies)
    if mode == "role":
        policyJson = filter_roles_by_principal(iam_client, policy_json['Arn'], None)
        if isinstance(policyJson, list):
            if policyJson:
                for role_iam in policyJson:
                    role_iam = process_iam(iam_client, role_iam, mode, envPolicies)
    return policyJson

def envInlineCollection(iam_client, entityJson, policy_json, mode):
    if entityJson.get('InlinePolicies') is None:
        inline_policy_json = list_inline_policies(iam_client, entityJson[f'{mode.capitalize()}Name'], mode)
        if isinstance(inline_policy_json, list):
            entityJson['InlinePolicies'] = inline_policy_json
            policy_json['InlinePolicies'] = inline_policy_json
    else:
        if entityJson.get('InlinePolicies', []):
            if entityJson['InlinePolicies'][0].get('Statement') is None:
                entityJson['InlinePolicies'] = get_inline_policy(iam_client, entityJson[f'{mode.capitalize()}Name'], entityJson['InlinePolicies'], mode)
        policy_json['InlinePolicies'] = policy_json.get("InlinePolicies", []) + entityJson.get("InlinePolicies", [])
    return entityJson, policy_json

def envAttachedCollection(iam_client, entityJson, policy_json, envData, mode):
    with envData.policies_context() as envPolicies:
        env_policy_names = {policy['PolicyName'] for policy in envPolicies}
        if entityJson.get('AttachedManagedPolicies') is None:
            attached_policy_json = list_attached_policies(iam_client, entityJson[f'{mode.capitalize()}Name'], mode)
            if isinstance(attached_policy_json, list):
                entityJson['AttachedManagedPolicies'] = attached_policy_json
                for userAttachedPolicy in entityJson['AttachedManagedPolicies']:
                    if userAttachedPolicy.get('Statement') is None:
                        for envPolicy in envPolicies:
                            if (envPolicy['PolicyName'] == userAttachedPolicy['PolicyName']):
                                if envPolicy.get('Statement') is not None:
                                    # userAttachedPolicy = userAttachedPolicy | envPolicy
                                    # envPolicy = userAttachedPolicy | envPolicy
                                    userAttachedPolicy.update(envPolicy)
                                break
                    else:
                        if userAttachedPolicy['PolicyName'] not in env_policy_names:
                            envPolicies.append(userAttachedPolicy)
                        else:
                            for envPolicy in envPolicies:
                                if envPolicy['PolicyName'] == userAttachedPolicy['PolicyName']:
                                    if envPolicy.get('Statement') is None:
                                        # envPolicy = envPolicy | userAttachedPolicy
                                        # userAttachedPolicy = envPolicy | userAttachedPolicy
                                        envPolicy.update(userAttachedPolicy)
                                        break
                policy_json['AttachedManagedPolicies'] = policy_json.get("AttachedManagedPolicies", []) + entityJson.get("AttachedManagedPolicies", [])
        else:
            for userAttachedPolicy in entityJson['AttachedManagedPolicies']:
                cond_policy = False
                if userAttachedPolicy.get('Statement') is None:
                    for envPolicy in envPolicies:
                        if (envPolicy['PolicyName'] == userAttachedPolicy['PolicyName']):
                            if envPolicy.get('Statement') is not None:
                                # userAttachedPolicy = userAttachedPolicy | envPolicy
                                # envPolicy = userAttachedPolicy | envPolicy
                                userAttachedPolicy.update(envPolicy)
                                cond_policy = True
                            break
                else:
                    cond_policy = True
                    if userAttachedPolicy['PolicyName'] not in env_policy_names:
                        envPolicies.append(userAttachedPolicy)
                    else:
                        for envPolicy in envPolicies:
                            if (envPolicy['PolicyName'] == userAttachedPolicy['PolicyName']):
                                if envPolicy.get('Statement') is None:
                                    envPolicy.update(userAttachedPolicy)
                                    # envPolicy = envPolicy | userAttachedPolicy
                                    # userAttachedPolicy = envPolicy | userAttachedPolicy
                                break
                if not cond_policy:
                    userAttachedPolicy = get_attached_policies(iam_client, userAttachedPolicy)
                    for envPolicy in envPolicies:
                        if (envPolicy['PolicyName'] == userAttachedPolicy['PolicyName']):
                            if envPolicy.get('Statement') is None:
                                envPolicy.update(userAttachedPolicy)
                                # envPolicy = envPolicy | userAttachedPolicy
                                # userAttachedPolicy = envPolicy | userAttachedPolicy
                            break
            policy_json['AttachedManagedPolicies'] = policy_json.get("AttachedManagedPolicies", []) + entityJson.get("AttachedManagedPolicies", [])
    return entityJson, policy_json

def envPoliciesCollection(iam_client, entity, envData, mode):
    entity = process_iam(iam_client, entity, mode)
    if entity.get('AttachedManagedPolicies') is not None:
        with envData.policies_context() as envPolicies:
            env_policy_names = {policy['PolicyName'] for policy in envPolicies}
            for attachedPolicy in entity['AttachedManagedPolicies']:
                if attachedPolicy['PolicyName'] in env_policy_names:
                    if attachedPolicy.get('Statement') is None:
                        for envPolicy in envPolicies:
                            if attachedPolicy['PolicyName'] == envPolicy['PolicyName']:
                                if envPolicy.get('Statement') is not None:
                                    attachedPolicy.update(envPolicy)
                                    # attachedPolicy = attachedPolicy | envPolicy
                                    # envPolicy = attachedPolicy | envPolicy
                                break
                    else:
                        for envPolicy in envPolicies:
                            if attachedPolicy['PolicyName'] == envPolicy['PolicyName']:
                                if envPolicy.get('Statement') is None:
                                    envPolicy.update(attachedPolicy)
                                    # envPolicy = envPolicy | attachedPolicy
                                    # attachedPolicy = envPolicy | attachedPolicy
                                break
                else:
                    envPolicies.append(attachedPolicy)
    return entity

def envGroupRoleListCollection(userJson, policy_json):
    if userJson.get('GroupList') is None:
        if policy_json.get('GroupList') is not None:
            userJson['GroupList'] = policy_json['GroupList']
    if policy_json.get('GroupList') is None:
        if userJson.get('GroupList') is not None:
            policy_json['GroupList'] = userJson['GroupList']
    
    if userJson.get('RoleList') is None:
        if policy_json.get('RoleList') is not None:
            userJson['RoleList'] = policy_json['RoleList']
    if policy_json.get('RoleList') is None:
        if userJson.get('RoleList') is not None:
            policy_json['RoleList'] = userJson['RoleList']
    
    return userJson, policy_json

def envUsersCollection(iam_client, policy_json, envData):
    with envData.users_context() as envUsers:
        if any(userJson['UserName'] == policy_json['UserName'] for userJson in envUsers if envUsers):
            for userJson in envUsers:
                if userJson['UserName'] == policy_json['UserName']:
                    userJson, policy_json = envInlineCollection(iam_client, userJson, policy_json, "user")
                    userJson, policy_json = envAttachedCollection(iam_client, userJson, policy_json, envData, "user")
                    userJson, policy_json = envGroupRoleListCollection(userJson, policy_json)
                    break
        else:
            policy_json = envPoliciesCollection(iam_client, policy_json, envData, "user")
            envUsers.append(policy_json)
    return policy_json
    
def envGroupsCollection(iam_client, group, unmatching_groups, envData):
    with envData.groups_context() as envGroups:
        for groupJson in envGroups:
            if groupJson['GroupName'] == group['GroupName']:
                groupJson, group = envInlineCollection(iam_client, groupJson, group, "group")
                groupJson, group = envAttachedCollection(iam_client, groupJson, group, envData, "group")
                break
        if unmatching_groups:
            for unmatchGroup in unmatching_groups:
                if unmatchGroup['GroupName'] == group['GroupName']:
                    group = envPoliciesCollection(iam_client, group, envData, "group")
                    envGroups.append(group)
                    break
    return group

def envRolesCollection(iam_client, role, unmatching_roles, envData):
    with envData.roles_context() as envRoles:
        for roleJson in envRoles:
            if roleJson['RoleName'] == role['RoleName']:
                roleJson, role = envInlineCollection(iam_client, roleJson, role, "role")
                roleJson, role = envAttachedCollection(iam_client, roleJson, role, envData, "role")
                break
        if unmatching_roles:
            for roleJson in unmatching_roles:
                if roleJson['RoleName'] == role['RoleName']:
                    role = envPoliciesCollection(iam_client, role, envData, "role")
                    envRoles.append(role)
                    break
    return role

def enumerate_iam_to_json(iam_client, policy_json, envPolicies):
    group_policy_json = list_object_iam(iam_client, policy_json, envPolicies, "group")
    if isinstance(group_policy_json, list):
        policy_json['GroupList'] = group_policy_json
    role_policy_json = list_object_iam(iam_client, policy_json, envPolicies, "role")
    if role_policy_json:
        policy_json['RoleList'] = role_policy_json
    policy_json = list_object_iam(iam_client, policy_json, envPolicies, "user")

    return policy_json

def enumerate_iam_to_json_cross(iam_client, policy_json, envData, mode="default"):
    iam_groups = list_groups_for_user(iam_client, policy_json['UserName'], envData.groupsAll)
    if isinstance(iam_groups, list):
        policy_json['GroupList'] = iam_groups
        unmatching_groups = [group for group in policy_json['GroupList'] if group['GroupName'] not in {r['GroupName'] for r in envData.groups}]
        for group in policy_json['GroupList']:
            group = envGroupsCollection(iam_client, group, unmatching_groups, envData)

    iam_roles = filter_roles_by_principal(iam_client, policy_json['Arn'], envData.roles)
    if isinstance(iam_roles, list):
        policy_json['RoleList'] = iam_roles
        unmatching_roles = [role for role in policy_json['RoleList'] if role['RoleName'] not in {r['RoleName'] for r in envData.roles}]
        for role in policy_json['RoleList']:
            role = envRolesCollection(iam_client, role, unmatching_roles, envData)

    policy_json = envUsersCollection(iam_client, policy_json, envData)

    if mode == "extract":
        return policy_json