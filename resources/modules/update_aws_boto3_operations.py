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

import json
import requests
import logging
import re
import os

def update_boto3_iam_read_operations():
    logging.info("Updating [Resource] AWS Boto3 IAM Read-Only Operations...")
    IAM_READ_OPERATION_LIST = dict()
    url = "https://awspolicygen.s3.amazonaws.com/js/policies.js"
    file_name = "boto3_iam_operations.py"

    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        logging.error(f"Failed to update the boto3 iam operations: {e}")
    else:
        aws_operations = json.loads(response.text.replace("app.PolicyEditorConfig=", ""))

    for service in aws_operations['serviceMap'].values():
        if service['StringPrefix'] not in IAM_READ_OPERATION_LIST:
            IAM_READ_OPERATION_LIST[service['StringPrefix']] = [re.sub(r'(?<!^)(?=[A-Z])', '_', item).lower() for item in service['Actions'] if item.startswith(("List", "Get", "Describe"))
    ]

    if IAM_READ_OPERATION_LIST:
        merged_library_filename = os.path.join("resources/libraries", file_name)
        with open(merged_library_filename, 'w') as outfile:
            outfile.write(f"IAM_READ_OPERATION_LIST = {json.dumps(IAM_READ_OPERATION_LIST, indent=4)}\n")

    logging.info("AWS Boto3 IAM Read-Only Operations has been updated!")