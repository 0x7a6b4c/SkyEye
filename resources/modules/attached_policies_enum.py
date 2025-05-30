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

import botocore, json
from . import remove_metadata, version_checking, get_policy_version_safe, statement_filterings
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_attached_policies(iam_client, policy):
    if policy['PolicyArn'].split(':')[4] == "aws":
        try:
            f = open(f"policies/{policy['PolicyName']}.json", "r")
        except:
            pass
        else:
            result = json.loads(f.read())
            policy['DefaultVersionId'] = result['DefaultVersionId']
            policy['Statement'] = statement_filterings(result['Statement'])
    else:
        policy['OtherVersionIds'] = list()
        try:
            get_policy_json = iam_client.get_policy(PolicyArn=policy['PolicyArn'])
        except botocore.exceptions.ClientError as error:
            try:
                list_versions_response = iam_client.list_policy_versions(PolicyArn=policy['PolicyArn'])
            except botocore.exceptions.ClientError as error:
                validity = None
                try:
                    response = iam_client.get_policy_version(PolicyArn=policy['PolicyArn'], VersionId="v1")
                except botocore.exceptions.ClientError as error:
                    if error.response['Error']['Code'] == 'AccessDenied':
                        return policy
                    elif error.response['Error']['Code'] == 'NoSuchEntity':
                        validity = 2
                    else:
                        return policy
                else:
                    if response["PolicyVersion"]["IsDefaultVersion"]:
                        policy['DefaultVersionId'] = "v1"
                        policy['Statement'] = statement_filterings(remove_metadata(response['PolicyVersion']['Document']['Statement']))
                    else:
                        validity = 1

                if validity:
                    with ThreadPoolExecutor(max_workers=10) as executor:
                        futures = [
                            executor.submit(get_policy_version_safe, iam_client, policy['PolicyArn'], f"v{vid}")
                            for vid in range(validity, 100, 1)
                        ]
                        for future in as_completed(futures):
                            response, version_id = future.result()
                            if response:
                                if response["PolicyVersion"]["IsDefaultVersion"]:
                                    policy['DefaultVersionId'] = version_id
                                    policy['Statement'] = statement_filterings(remove_metadata(response['PolicyVersion']['Document']['Statement']))
                                else:
                                    policy['OtherVersionIds'].append(version_id)
            else:
                for version in list_versions_response['Versions']:
                    if version['IsDefaultVersion']:
                        policy['DefaultVersionId'] = version['VersionId']
                    else:
                        policy['OtherVersionIds'].append(version['VersionId'])
        else:
            policy['DefaultVersionId'] = get_policy_json['Policy']['DefaultVersionId']
            
        if policy.get('DefaultVersionId') and not policy.get('Statement', []):
            try:
                response = iam_client.get_policy_version(
                    PolicyArn=policy['PolicyArn'],
                    VersionId=policy['DefaultVersionId']
                )
            except botocore.exceptions.ClientError as error:
                pass
            else:
                policy['Statement'] = statement_filterings(remove_metadata(response['PolicyVersion']['Document']['Statement']))
        if policy.get('Statement', []):
            policy = version_checking(policy, iam_client)
    
    return policy
    
def list_attached_policies(iam_client, targetName, mode, envPolicies=None):
    if mode == "user":
        try:
            attached_policies = iam_client.list_attached_user_policies(UserName=targetName)
        except botocore.exceptions.ClientError as error:
            return None
    elif mode == "group":
        try:
            attached_policies = iam_client.list_attached_group_policies(GroupName=targetName)
        except botocore.exceptions.ClientError as error:
            return None
    elif mode == "role":
        try:
            attached_policies = iam_client.list_attached_role_policies(RoleName=targetName)
        except botocore.exceptions.ClientError as error:
            return None
        
    if attached_policies.get('AttachedPolicies', []):
        policy_json = attached_policies['AttachedPolicies']
        for policy in policy_json:
            if envPolicies:
                condition = False
                for envPolicy in envPolicies:
                    if policy['PolicyArn'] == envPolicy['PolicyArn']:
                        policy.update(envPolicy)
                        condition = True
                        break
                if not condition:
                    policy = get_attached_policies(iam_client, policy)
                    envPolicies.append(policy)
            else:
                policy = get_attached_policies(iam_client, policy)
    else:
        return list()

    return policy_json