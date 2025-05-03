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
from concurrent.futures import ThreadPoolExecutor, as_completed
from . import regex_filtering

def get_policy_version_safe(iam_client, policy_arn, version_id):
    try:
        response = iam_client.get_policy_version(
            PolicyArn=policy_arn,
            VersionId=version_id
        )
    except botocore.exceptions.ClientError:
        return None, version_id
    else:
        return response, version_id

def policy_new_check(policy1, policy2):
    set1 = set(policy1)
    set2 = set(policy2)
    new = set2.difference(set1)
    return list(new)

def version_diff(response, policy, version_id, new_actions_statement1):
    all_actions = set()
    new_actions_statement2 = []
    for statement in response['PolicyVersion']['Document']['Statement']:
        if regex_filtering("Allow", statement['Effect']):
            current_actions = set(statement["Action"])
            new_actions = current_actions - all_actions
            all_actions.update(new_actions)
            new_actions_statement2.extend(new_actions)
    diff_version_action = policy_new_check(new_actions_statement1,new_actions_statement2)
    if diff_version_action:
        all_resources = set()
        new_resources_statement = list()
        for statement in response['PolicyVersion']['Document']['Statement']:
            if regex_filtering("Allow", statement['Effect']):
                current_resources = set(statement["Resource"])
                new_resources = current_resources - all_resources
                all_resources.update(new_resources)
                new_resources_statement.extend(new_resources)
        policy['HistoricPolicyVersionDetection'].append({"PolicyVersionId":version_id,"Statement":diff_version_action,"Resource":new_resources_statement})

def version_checking(policy, iam_client):
    policy['HistoricPolicyVersionDetection'] = list()
    all_actions = set()
    new_actions_statement1 = []
    for statement in policy['Statement']:
        if regex_filtering("Allow", statement['Effect']):
            current_actions = set(statement["Action"])
            new_actions = current_actions - all_actions
            all_actions.update(new_actions)
            new_actions_statement1.extend(new_actions)
    if policy.get('OtherVersionIds', []):
        for version_id in policy["OtherVersionIds"]:
            try:
                response, version_id = get_policy_version_safe(iam_client, policy['PolicyArn'], version_id)
            except botocore.exceptions.ClientError as error:
                pass
            else:
                version_diff(response, policy, version_id, new_actions_statement1)
    else:
        default_version_id = int(policy['DefaultVersionId'][1:])
        version_ids = set()

        for offset in range(1, 70, 1):
            prev_version_id = default_version_id - offset
            next_version_id = default_version_id + offset
            
            if prev_version_id >= 1:
                version_ids.add(prev_version_id)
            version_ids.add(next_version_id)

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [
                executor.submit(get_policy_version_safe, iam_client, policy['PolicyArn'], f"v{vid}")
                for vid in version_ids
            ]
            for future in as_completed(futures): 
                response, version_id = future.result()
                if response:
                    version_diff(response, policy, version_id, new_actions_statement1)
                    policy['OtherVersionIds'].append(version_id)
    return policy