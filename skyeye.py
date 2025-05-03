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

import time
import argparse
import resources.threads_config

from resources.utils import configure_logging, load_credentials_from_json, ensure_completed_scan_folder, update_max_threads
from resources.mode_loader import singleUserSeparationMode, multipleUserCrossMode
from resources.modules import update_aws_managed_policies, update_boto3_iam_read_operations, iam_permission_fuzzing

def main():
    configure_logging()
    parser = argparse.ArgumentParser(description='Enumerate IAM Permissions')

    parser.add_argument('--json-file', help='Path to JSON file containing AWS credentials')
    parser.add_argument('--mode', help='Scanning mode: cross-entities, separate-entities')
    parser.add_argument('--thread', type=int, help=f"Number of threads to be used - [default = {resources.threads_config.MAX_THREADS}]", default=resources.threads_config.MAX_THREADS)

    update_group = parser.add_argument_group('Update AWS Policies')
    update_group.add_argument('--update', action='store_true', help='Update resources of AWS Managed policies and Boto3 IAM Read-only operations')

    credential_group = parser.add_argument_group('Individual Credentials')
    credential_group.add_argument('--access-key', help='AWS Access Key')
    credential_group.add_argument('--secret-key', help='AWS Secret Key')
    credential_group.add_argument('--session-token', help='STS Session Token', default='')
    credential_group.add_argument('--region', help='AWS region', default='us-east-1')
    credential_group.add_argument('--fuzz', action='store_true', help='Enabling IAM Fuzzing technique [Individual Credentials Only]')

    args = parser.parse_args()

    if args.thread and all(
            value == parser.get_default(key)
            for key, value in vars(args).items()
            if key != 'thread'
        ):
        update_max_threads(args.thread)
        return
    elif args.thread:
        update_max_threads(args.thread)

    if args.update:
        update_boto3_iam_read_operations()
        update_aws_managed_policies()
        return

    if args.json_file:
        if not args.mode:
            parser.error("--mode are required when using --json-file")
        if (args.mode != 'separate-entities') and (args.mode != 'cross-entities'):
            parser.error("--mode only supports [separate-entities] and [cross-entities] mode")
        
        credentials_list = load_credentials_from_json(args.json_file)

        if not isinstance(credentials_list, list):
            parser.error("JSON file must contain a list of credentials.")
        output_folder = ensure_completed_scan_folder()

        if args.mode == 'separate-entities':
            singleUserSeparationMode(credentials_list, output_folder)
        elif args.mode == 'cross-entities':
            multipleUserCrossMode(credentials_list, output_folder)
        else:
            parser.error("--mode only supports [separate-entities] and [cross-entities] mode")
    else:
        if not args.access_key or not args.secret_key:
            parser.error("--access-key and --secret-key are required when not using --json-file")
        output_folder = ensure_completed_scan_folder()
        credentials = {
            "AccessKey": args.access_key,
            "SecretKey": args.secret_key,
            "SessionToken": args.session_token,
            "Region": args.region
        }
        singleUserSeparationMode([credentials], output_folder)
        if args.fuzz:
            iam_permission_fuzzing(credentials, output_folder)

if __name__ == '__main__':
    start_time = time.time()
    main()
    end_time = time.time()
    print(end_time - start_time)