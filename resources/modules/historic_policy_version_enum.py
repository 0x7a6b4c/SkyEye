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
from . import statement_filterings

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
    
def version_statement_diff(current_version_statement, other_version_statement, other_version_id):
    def to_set(value):
        if isinstance(value, list):
            return set(value)
        elif isinstance(value, str):
            return {value}
        else:
            return set()

    # Process current version statements
    current_statements = {}
    current_no_sid = []
    for stmt in current_version_statement:
        if 'Sid' in stmt:
            current_statements[stmt['Sid']] = stmt
        else:
            current_no_sid.append(stmt)

    # Process other version statements
    other_statements = {}
    other_no_sid = []
    for stmt in other_version_statement:
        if 'Sid' in stmt:
            other_statements[stmt['Sid']] = stmt
        else:
            other_no_sid.append(stmt)

    current_sids = set(current_statements.keys())
    other_sids = set(other_statements.keys())

    old_sids = list(current_sids - other_sids)
    new_sids = list(other_sids - current_sids)
    common_sids = list(current_sids & other_sids)

    differences = {}

    for sid in common_sids:
        current_stmt = current_statements[sid]
        other_stmt = other_statements[sid]

        current_effect = current_stmt['Effect']
        other_effect = other_stmt['Effect']
        effect_status = 'NotChange' if current_effect == other_effect else 'Change'

        # Identify Action or NotAction between current and other
        current_action = current_stmt.get('Action')
        current_not_action = current_stmt.get('NotAction')
        other_action = other_stmt.get('Action')
        other_not_action = other_stmt.get('NotAction')

        current_action_type = 'Action' if current_action is not None else 'NotAction' if current_not_action is not None else None
        other_action_type = 'Action' if other_action is not None else 'NotAction' if other_not_action is not None else None

        action_status = 'Change' if current_action_type != other_action_type else 'NotChange'

        # Old/Kept/New for Action/NotAction permissions
        action_comparison = {}
        if action_status == 'NotChange':
            if current_action_type == 'Action':
                current_perms = to_set(current_action)
                other_perms = to_set(other_action)
            else:
                current_perms = to_set(current_not_action)
                other_perms = to_set(other_not_action)

            kept_perms = current_perms & other_perms
            old_perms = current_perms - other_perms
            new_perms = other_perms - current_perms

            action_comparison = {
                **({'New': list(new_perms)} if new_perms else {}),
                **({'Kept': list(kept_perms)} if kept_perms else {}),
                **({'Removed': list(old_perms)} if old_perms else {})
            }
        else:
            other_perms = to_set(other_action if other_action is not None else other_not_action)
            action_comparison = {
                **({'New': list(other_perms)} if other_perms else {}),
            }

        # Identify Resource or NotResource between current and other
        current_resource = current_stmt.get('Resource')
        current_not_resource = current_stmt.get('NotResource')
        other_resource = other_stmt.get('Resource')
        other_not_resource = other_stmt.get('NotResource')

        current_resource_type = 'Resource' if current_resource is not None else 'NotResource' if current_not_resource is not None else None
        other_resource_type = 'Resource' if other_resource is not None else 'NotResource' if other_not_resource is not None else None

        resource_status = 'Change' if current_resource_type != other_resource_type else 'NotChange'

        # Old/Kept/New for Resource/NotResource resource-scope
        resource_comparison = {}
        if resource_status == 'NotChange':
            if current_resource_type == 'Resource':
                current_res = to_set(current_resource)
                other_res = to_set(other_resource)
            else:
                current_res = to_set(current_not_resource)
                other_res = to_set(other_not_resource)

            kept_res = current_res & other_res
            old_res = current_res - other_res
            new_res = other_res - current_res

            resource_comparison = {
                **({'New': list(new_res)} if new_res else {}),
                **({'Kept': list(kept_res)} if kept_res else {}),
                **({'Removed': list(old_res)} if old_res else {})
            }
        else:
            other_res = to_set(other_resource if other_resource is not None else other_not_resource)
            resource_comparison = {
                **({'New': list(other_res)} if other_res else {}),
            }

        differences[sid] = {
            'Effect': other_effect,
            'EffectStatus': effect_status,
            'ActionStatus': action_status,
            'Action': action_comparison,
            'ResourceStatus': resource_status,
            'Resource': resource_comparison
        }

    # Process NewSids
    for new_sid in new_sids:
        other_stmt = other_statements[new_sid]
        effect = other_stmt['Effect']
        action = other_stmt.get('Action') or other_stmt.get('NotAction')
        resource = other_stmt.get('Resource') or other_stmt.get('NotResource')

        action_set = to_set(action)
        resource_set = to_set(resource)

        differences[new_sid] = {
            'Effect': effect,
            'EffectStatus': 'Change',
            'ActionStatus': 'Change',
            'Action': {
                **({'New': list(action_set)} if action_set else {})
            },
            'ResourceStatus': 'Change',
            'Resource': {
                **({'New': list(resource_set)} if resource_set else {})
            },
            **({"Condition": other_stmt["Condition"]} if "Condition" in other_stmt else {})
        }

    # Process OldSids
    for old_sid in old_sids:
        current_stmt = current_statements[old_sid]
        effect = current_stmt['Effect']
        action = current_stmt.get('Action') or current_stmt.get('NotAction')
        resource = current_stmt.get('Resource') or current_stmt.get('NotResource')

        action_set = to_set(action)
        resource_set = to_set(resource)

        differences[old_sid] = {
            'Effect': effect,
            'EffectStatus': 'Removed',
            'ActionStatus': 'Removed',
            'Action': {
                **({'Removed': list(action_set)} if action_set else {})
            },
            'ResourceStatus': 'Removed',
            'Resource': {
                **({'Removed': list(resource_set)} if resource_set else {})
            },
            **({"Condition": current_stmt["Condition"]} if "Condition" in current_stmt else {})
        }

    return {
        'PolicyVersionId': other_version_id,
        'SidStatus': {
        **{sid: 'Removed' for sid in old_sids},
        **{sid: 'NotChange' for sid in common_sids},
        **{sid: 'New' for sid in new_sids}
        },
        'Differences': differences,
        **({'NoSidStatement': other_no_sid} if other_no_sid else {})
    }
        
def version_checking(policy, iam_client):
    policy['HistoricPolicyVersionEnumeration'] = list()
    if policy.get('OtherVersionIds', []):
        for version_id in policy["OtherVersionIds"]:
            try:
                response, other_version_id = get_policy_version_safe(iam_client, policy['PolicyArn'], version_id)
            except botocore.exceptions.ClientError as error:
                pass
            else:
                other_version_statements = statement_filterings(response['PolicyVersion']['Document']['Statement'])
                diff_version_statements = version_statement_diff(policy['Statement'], other_version_statements, other_version_id)
                policy['HistoricPolicyVersionEnumeration'].append(diff_version_statements)
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
                response, other_version_id = future.result()
                if response:
                    other_version_statements = statement_filterings(response['PolicyVersion']['Document']['Statement'])
                    diff_version_statements = version_statement_diff(policy.get('Statement', []), other_version_statements, other_version_id)
                    policy['HistoricPolicyVersionEnumeration'].append(diff_version_statements)
                    policy['OtherVersionIds'].append(version_id)
    return policy