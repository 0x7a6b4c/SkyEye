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

def list_groups_for_user(iam_client, targetUserName):
    try:
        iam_groups = iam_client.list_groups_for_user(UserName=targetUserName)
    except botocore.exceptions.ClientError as error:
        return None
    else:
        group_json = []
        for group in iam_groups['Groups']:
            group_json.append({"GroupName":group['GroupName'],"GroupId":group['GroupId'],"Arn":group['Arn']})
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