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
from . import statement_filterings

def get_inline_policy(iam_client, targetName, policyList, mode="user"):
    for policy in policyList:
        if mode == "user":
            try:
                get_user_policy_json = iam_client.get_user_policy(UserName=targetName,PolicyName=policy['PolicyName'])
            except botocore.exceptions.ClientError as error:
                pass
            else:
                policy['Statement'] = statement_filterings(get_user_policy_json['PolicyDocument']['Statement'])
        elif mode == "group":
            try:
                get_group_policy_json = iam_client.get_group_policy(GroupName=targetName,PolicyName=policy['PolicyName'])
            except botocore.exceptions.ClientError as error:
                pass
            else:
                policy['Statement'] = statement_filterings(get_group_policy_json['PolicyDocument']['Statement'])
        elif mode == "role":
            try:
                get_role_policy_json = iam_client.get_role_policy(RoleName=targetName,PolicyName=policy['PolicyName'])
            except botocore.exceptions.ClientError as error:
                pass
            else:
                policy['Statement'] = statement_filterings(get_role_policy_json['PolicyDocument']['Statement'])

    return policyList

def list_inline_policies(iam_client, targetName, mode="user"):
    if mode == "user":
        try:
            list_policy_json = iam_client.list_user_policies(UserName=targetName)
        except botocore.exceptions.ClientError as error:
            return None
    elif mode == "group":
        try:
            list_policy_json = iam_client.list_group_policies(GroupName=targetName)
        except botocore.exceptions.ClientError as error:
            return None
    elif mode == "role":
        try:
            list_policy_json = iam_client.list_role_policies(RoleName=targetName)
        except botocore.exceptions.ClientError as error:
            return None

    if list_policy_json.get("PolicyNames", []):
        policy_json = list()
        for policy in list_policy_json['PolicyNames']:
            policy_json.append({"PolicyName":policy}) 
        policy_json = get_inline_policy(iam_client, targetName, policy_json, mode)
    else:
        return list()

    return policy_json