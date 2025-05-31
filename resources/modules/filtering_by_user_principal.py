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

import botocore
from . import assumeRoleIterationFilter

### Group Filtering

def list_groups_all(iam_client, envData):
    try:
        groups_all = iam_client.list_groups()
    except botocore.exceptions.ClientError as error:
        pass
    else:
        with envData.groupsAll_context() as envGroupsAll:
            if not envGroupsAll:
                envGroupsAll[:] = groups_all['Groups']

def list_policies_all(iam_client, envData):
    try:
        policies_all = iam_client.list_policies(Scope='All', OnlyAttached=True, PolicyUsageFilter='PermissionsPolicy')['Policies']
    except botocore.exceptions.ClientError as error:
        pass
    else:
        with envData.policiesAll_context() as envPoliciesAll:
            if not envPoliciesAll:
                keys_to_exclude = ["PolicyId","Path","AttachmentCount","PermissionsBoundaryUsageCount","IsAttachable","CreateDate","UpdateDate"]
                for policy in policies_all:
                    for removed_key in keys_to_exclude:
                        del policy[removed_key]
                    policy['PolicyArn'] = policy.pop('Arn')
                envPoliciesAll[:] = policies_all

def list_groups_for_user(iam_client, targetUserName, envGroupsAll):
    try:
        iam_groups = iam_client.list_groups_for_user(UserName=targetUserName)
    except botocore.exceptions.ClientError as error:
        pass
    else:
        group_json = []
        for group in iam_groups['Groups']:
            group_json.append({"GroupName":group['GroupName'],"GroupId":group['GroupId'],"Arn":group['Arn']})
        return group_json
    
    if envGroupsAll:
        group_list = []
        for group in envGroupsAll:
            group_list.append({"GroupName":group['GroupName'],"GroupId":group['GroupId'],"Arn":group['Arn']})
    else:
        try:
            iam_groups_list = iam_client.list_groups()
        except botocore.exceptions.ClientError as error:
            return None
        else:
            group_list = []
            for group in iam_groups_list['Groups']:
                group_list.append({"GroupName":group['GroupName'],"GroupId":group['GroupId'],"Arn":group['Arn']})
    
    group_json = []
    for group in group_list:
        try:
            iam_groups_get = iam_client.get_group(GroupName=group['GroupName'])
        except botocore.exceptions.ClientError as error:
            return None
        else:
            user_groups_get = [user['UserName'] for user in iam_groups_get['Users']]
            if targetUserName in user_groups_get:
                group_json.append(group)
    
    return group_json

    
### Role Filtering (Include assumeRoleIterationFilter)

def filter_roles_by_principal_in_envRoles(targetArn, envRoles):
    iam_roles = []
    for role in envRoles:
        for statement in role['AssumeRolePolicyStatement']:
            if statement['Effect'] == 'Allow':
                action = False
                for statement_action in statement['Action']:
                    if statement_action == "sts:AssumeRole":
                        action = True
                if action:
                    for key, value in statement['Principal'].items():
                        if key == "AWS" and value == targetArn:
                            iam_roles.append(role)
    return iam_roles

def filter_roles_by_principal(iam_client, targetArn, envRoles):
    try:
        iam_roles = iam_client.list_roles()
    except botocore.exceptions.ClientError as error:
        if envRoles:
            filtered_iam_roles = filter_roles_by_principal_in_envRoles(targetArn, envRoles)
            if filtered_iam_roles:
                return filtered_iam_roles
        return None
    else:
        roleListAll = iam_roles['Roles']
        roleList = assumeRoleIterationFilter([targetArn], roleListAll, None)
        if roleList:
            return roleList
        else:
            return []