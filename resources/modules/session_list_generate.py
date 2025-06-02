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

import boto3, logging, botocore
from . import remove_metadata

def session_list_generation(credentials_list):
    session_list = []
    sts_caller_identity_list = []
    for index, credentials in enumerate(credentials_list):
        session = boto3.Session(
            aws_access_key_id=credentials['AccessKey'],
            aws_secret_access_key=credentials['SecretKey'],
            aws_session_token=credentials.get('SessionToken', ''),
            region_name=credentials.get('Region', 'us-east-1')
        )

        sts_client = session.client('sts')
        try:
            sts_caller_identity = remove_metadata(sts_client.get_caller_identity())
        except (botocore.exceptions.ClientError,
            botocore.exceptions.EndpointConnectionError,
            botocore.exceptions.ReadTimeoutError) as e:
            logging.warning(f"Credentials set {index + 1} failed validation: {e}")
            continue
        
        sts_caller_identity['AccessKey'] = credentials['AccessKey']
        sts_caller_identity['UserName'] = sts_caller_identity['Arn'].split('/')[-1]
        session_list.append(session)
        sts_caller_identity_list.append(sts_caller_identity)

    return session_list, sts_caller_identity_list