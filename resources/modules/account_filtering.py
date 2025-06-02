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

import logging, boto3, botocore
from collections import Counter

def get_unique_access_keys(credentials):
    unique_dict = {}
    for index, cred in enumerate(credentials):
        if 'AccessKey' not in cred or 'SecretKey' not in cred:
            logging.warning(f"Skipping credentials set {index + 1}: 'AccessKey' and 'SecretKey' are required.")
            continue
        cred['SessionToken'] = cred.get('SessionToken', '')
        cred['Region'] = cred.get('Region', 'us-east-1')

        access_key = cred.get("AccessKey")
        if access_key and access_key not in unique_dict:
            unique_dict[access_key] = cred
    return list(unique_dict.values())

def validate_credentials(credentials, index, results):
    sts_client = boto3.client(
        aws_access_key_id=credentials['AccessKey'],
        aws_secret_access_key=credentials['SecretKey'],
        aws_session_token=credentials.get('SessionToken', ''),
        region_name=credentials.get('Region', 'us-east-1'),
        service_name="sts"
    )

    try:
        sts = sts_client.get_caller_identity()
        results.append({f"{index}:{sts['Account']}": sts['Arn']})
    except (botocore.exceptions.ClientError,
            botocore.exceptions.EndpointConnectionError,
            botocore.exceptions.ReadTimeoutError) as e:
            logging.warning(f"Credentials set {index + 1} failed validation: {e}")

def account_filterings(credentials_list):
    credentials_list = get_unique_access_keys(credentials_list)
    targetUserArns = []

    for index, credentials in enumerate(credentials_list):
        validate_credentials(credentials, index, targetUserArns)

    values_targetUserArns = [list(item.keys())[0].split(":")[1] for item in targetUserArns]
    counter_targetUserArns = Counter(values_targetUserArns)
    most_common_value, max_count = counter_targetUserArns.most_common(1)[0]
    output = dict()

    if max_count > 1:
        for account_id in list(counter_targetUserArns):
            filtered_index = sorted([int(list(item.keys())[0].split(":")[0]) for item in targetUserArns if list(item.keys())[0].split(":")[1] == account_id])
            filtered_credentials_list = [credentials_list[i] for i in filtered_index]
            output[account_id] = filtered_credentials_list
        return output
    else:
        logging.warning("No more than one of provided credentials are from the same account number!")
        logging.info("Turning into [separate-users] scanning mode!")
        return output