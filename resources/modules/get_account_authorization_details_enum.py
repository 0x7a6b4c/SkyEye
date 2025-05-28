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

import botocore, json, logging
from ..utils import remove_metadata, json_encoder
from . import (AWS_POLICIES, enumerate_iam_to_json, enumerate_iam_to_json_cross, list_groups_all,
               filteringListIdentitiesForPolicy, checkingLIFPPermission, scanningListIdentitiesForPolicy, 
               all_iam_json_enum)

def getAccountAuthorizationDetailsEnum(iam_client, sts_caller_identity, envData):
    policy_json = {}
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
                envAll.append(all_iamJson[next((i for i, d in enumerate(all_iam['UserDetailList']) if d["Arn"] == sts_caller_identity['Arn']), -1)])
        return
    
    policy_json = remove_metadata(sts_caller_identity)
    policy_json['UserName'] = sts_caller_identity['Arn'].split('/')[-1]
    with envData.policies_context() as envPolicies:
        output = enumerate_iam_to_json(iam_client, policy_json, envPolicies)
    with envData.arns_context() as arns_list:
        arns_list[:] = [sts_caller_identity['Arn']]
    with envData.users_context() as envUsers:
        envUsers[:] = [output]
    with envData.groups_context() as envGroups:
        envGroups[:] = output.get('GroupList', [])
    with envData.roles_context() as envRoles:
        envRoles[:] = output.get('RoleList', [])
    
    total_policies, reScanNamePolicies = filteringListIdentitiesForPolicy(envData.users, envData.groups, envData.roles)
    with envData.policies_context() as envPolicies:
        envPolicies[:] = total_policies
    if reScanNamePolicies.get("Users") or reScanNamePolicies.get("Groups") or reScanNamePolicies.get("Roles"):
        if checkingLIFPPermission(iam_client):
            if reScanNamePolicies.get("Users"):
                logging.info("Identified missing IAM AttachedManagedPolicies component at ['User'] entity level!")
            if reScanNamePolicies.get("Groups"):
                logging.info("Identified missing IAM AttachedManagedPolicies component at ['Group'] entity level!")
            if reScanNamePolicies.get("Roles"):
                logging.info("Identified missing IAM AttachedManagedPolicies component at ['Role'] entity level!")
            logging.info("Identified permitted [ListIdentityForPolicies] action!")
            logging.info("Attempting to perform IAM [ListRoles / ListIdentityForPolicies] method to supplement...")
            scanningListIdentitiesForPolicy(iam_client, reScanNamePolicies, AWS_POLICIES, envData)
            logging.info("Completed IAM [ListRoles / ListIdentityForPolicies] method !")

    return output

def getAccountAuthorizationDetailsEnumCross(iam_client, sts_caller_identity, targetUserArns, stop_event, envData, mode):
    list_groups_all(iam_client, envData)
    policy_json = {}
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
        if stop_event.is_set():
            return
        all_iamJson = json.loads(json.dumps(remove_metadata(all_iam), default=json_encoder))
        all_iamJson = all_iam_json_enum(all_iamJson)
        with envData.all_context() as envAll:
            if not envAll:
                for targetUserArn in targetUserArns:
                    envAll.append(all_iamJson[next((i for i, d in enumerate(all_iam['UserDetailList']) if d["Arn"] == targetUserArn), -1)])
        return

    policy_json = remove_metadata(sts_caller_identity)
    if mode == "default":
        for targetUserArn in targetUserArns:
            if stop_event.is_set():
                return
            cross_policy_json = {}
            cross_policy_json['Arn'] = targetUserArn
            cross_policy_json['UserName'] = targetUserArn.split('/')[-1]
            enumerate_iam_to_json_cross(iam_client, cross_policy_json, envData)
    if mode == "extract":
        if stop_event.is_set():
            return
        output = enumerate_iam_to_json_cross(iam_client, policy_json, envData, mode)
        return output