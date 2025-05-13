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
from copy import deepcopy
from . import (AWS_POLICIES, remove_metadata, json_encoder, 
               list_groups_for_user, filter_roles_by_principal, 
               envUsersCollection, envGroupsCollection, envRolesCollection, 
               filteringListIdentitiesForPolicy, checkingLIFPPermission, scanningListIdentitiesForPolicy, 
               get_attached_policies, all_iam_json_enum)

def envEntitiesSupplement(session, reScanEnvEntities, envData, targetUserArns=list(), mode="default"):
    iam_client = session.client("iam")
    if reScanEnvEntities.get("Users", []):
        for reScanUser in reScanEnvEntities['Users']:
            entity = deepcopy(envData.users[reScanUser])
            if mode == "assumed-role":
                if not entity.get("GroupList", []):
                    iam_groups = list_groups_for_user(iam_client, entity['UserName'])
                    if isinstance(iam_groups, list):
                        entity['GroupList'] = iam_groups
                        unmatching_groups = [group for group in entity['GroupList'] if any(group['GroupName'] != groupJson['GroupName'] for groupJson in envData.groups)]
                        for group in entity['GroupList']:
                            group = envGroupsCollection(iam_client, group, unmatching_groups, envData)
                if not entity.get("RoleList", []):
                    iam_roles = filter_roles_by_principal(iam_client, entity['Arn'], envData.roles)
                    if isinstance(iam_roles, list):
                        entity['RoleList'] = iam_roles
                        unmatching_roles = [role for role in entity['RoleList'] if any(role['RoleName'] != roleJson['RoleName'] for roleJson in envData.roles)]
                        for role in entity['RoleList']:
                            role = envRolesCollection(iam_client, role, unmatching_roles, envData)

            for key in ("InlinePolicies", "AttachedManagedPolicies"):
                entity.pop(key, None)
            envUsersCollection(iam_client, entity, envData)
    if reScanEnvEntities.get("Groups", []):
        for reScanGroup in reScanEnvEntities['Groups']:
            entity = deepcopy(envData.groups[reScanGroup])
            for key in ("InlinePolicies", "AttachedManagedPolicies"):
                entity.pop(key, None)
            envGroupsCollection(iam_client, entity, [], envData)
    if reScanEnvEntities.get("Roles", []):
        for reScanRole in reScanEnvEntities['Roles']:
            entity = deepcopy(envData.roles[reScanRole])
            for key in ("InlinePolicies", "AttachedManagedPolicies"):
                entity.pop(key, None)
            envRolesCollection(iam_client, entity, [], envData)
    if reScanEnvEntities.get("Policies", []):
        for reScanPolicy in reScanEnvEntities['Policies']:
            with envData.policies_context() as envPolicies:
                envPolicies[reScanPolicy] = get_attached_policies(iam_client, envPolicies[reScanPolicy])
    if mode == "assumed-role":
        try:
            # Initialize variables for pagination
            all_iam = {
                "UserDetailList": [],
                "GroupDetailList": [],
                "RoleDetailList": [],
                "Policies": []
            }
            marker = None
            is_truncated = True

            # Loop through all pages
            while is_truncated:
                if marker:
                    response = iam_client.get_account_authorization_details(Marker=marker)
                else:
                    response = iam_client.get_account_authorization_details()

                # Merge results into all_iam
                for key in all_iam.keys():
                    if key in response:
                        all_iam[key].extend(response[key])

                # Check if there are more pages
                is_truncated = response.get("IsTruncated", False)
                marker = response.get("Marker", None)
        except (botocore.exceptions.ClientError,
                botocore.exceptions.EndpointConnectionError,
                botocore.exceptions.ReadTimeoutError):
            pass
        else:
            all_iamJson = json.loads(json.dumps(remove_metadata(all_iam), default=json_encoder))
            all_iamJson = all_iam_json_enum(all_iamJson)
            with envData.all_context() as envAll:
                if not envAll:
                    for targetUserArn in targetUserArns:
                        envAll.append(all_iamJson[next((i for i, d in enumerate(all_iam['UserDetailList']) if d["Arn"] == targetUserArn), -1)])
                    return
        
        total_policies, reScanNamePolicies = filteringListIdentitiesForPolicy(envData.users, envData.groups, envData.roles)
        if reScanNamePolicies.get("Users") or reScanNamePolicies.get("Groups") or reScanNamePolicies.get("Roles"):
            if checkingLIFPPermission(iam_client):
                scanningListIdentitiesForPolicy(iam_client, reScanNamePolicies, AWS_POLICIES, envData)