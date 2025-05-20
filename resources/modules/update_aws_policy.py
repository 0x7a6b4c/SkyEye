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

import json, requests, os, shutil, logging, importlib
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
import resources.threads_config

def extract_policies(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    highlights_div = soup.find('div', class_='highlights')
    if not highlights_div:
        return {}
    
    policy_items = highlights_div.find_all('li')
    
    policies = {}
    base_url = "https://docs.aws.amazon.com/aws-managed-policy/latest/reference/"
    
    for item in policy_items:
        anchor = item.find('a')
        if anchor:
            policy_name = anchor.text.strip()
            policy_name = ' '.join(policy_name.split())
            href = anchor.get('href', '')
            if href.startswith('./'):
                href = base_url + href[2:]
            elif not href.startswith('http'):
                href = base_url + href
            
            policies[policy_name] = href
    
    return policies

def parse_policy_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    policy_name = soup.find('h1', {'class': 'topictitle'}).get_text(strip=True)

    arn_tag = soup.find('b', string='ARN')
    if arn_tag:
        arn = arn_tag.find_next('code').get_text(strip=True)
        if arn.startswith("arn:aws:iam::aws:policy/aws-service-role/"):
            return None
    else:
        return None

    version_heading = soup.find('h2', id=lambda x: x and x.endswith('-version'))
    version_tag = version_heading.find_next('p') if version_heading else None
    version_text = version_tag.get_text(strip=True) if version_tag else ''
    default_version = version_text.split(':')[-1].strip().split()[0]

    json_code_tag = soup.find('code', class_='json')
    json_text = json_code_tag.get_text(strip=True) if json_code_tag else '{}'
    policy_doc = json.loads(json_text)

    structured_policy = {
        "PolicyName": policy_name,
        "PolicyArn": arn,
        "DefaultVersionId": default_version,
        "Statement": policy_doc.get("Statement", [])
    }

    return structured_policy

def save_json_to_aws_policies(data, filename):
    if isinstance(data, dict):
        merged_filename = os.path.join("policies", filename)
        with open(merged_filename, 'w') as f:
            json.dump(data, f, indent=2)
    else:
        merged_library_filename = os.path.join("resources/libraries", filename)
        with open(merged_library_filename, 'w') as f:
            f.write(data)

def remove_aws_policies_dir(directory):
    if os.path.exists(directory):
        shutil.rmtree(directory)

def aws_policy_crawling(policy_key, policy_value, aws_policy_arn, aws_policy_dict):
    response = requests.get(policy_value)
    if response.status_code == 200:
        structured_policy = parse_policy_html(response.text)
        if structured_policy:
            save_json_to_aws_policies(structured_policy, f"{policy_key}.json")
            aws_policy_arn.append(
                {
                    'PolicyName':structured_policy["PolicyName"],
                    'PolicyArn':structured_policy["PolicyArn"]
                }
            )
            aws_policy_dict[structured_policy["PolicyName"]] = {
                'PolicyName':structured_policy["PolicyName"],
                'PolicyArn':structured_policy["PolicyArn"]
            }

def update_aws_managed_policies():
    logging.info("Updating [Resource] AWS managed policies...")
    url = "https://docs.aws.amazon.com/aws-managed-policy/latest/reference/policy-list.html"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        logging.error(f"Failed to fetch the page: {e}")
    else:
        html_content = response.text

    try:
        policies = extract_policies(html_content)
    except Exception as e:
        logging.error(e)
    else:
        remove_aws_policies_dir("policies")
        aws_policy_arn = []
        aws_policy_dict = dict()
        if not os.path.exists("policies"):
            os.makedirs("policies")

        importlib.reload(resources.threads_config)
        with ThreadPoolExecutor(max_workers=resources.threads_config.MAX_THREADS) as executor:
            futures = []
            for policy_key, policy_value in policies.items():
                future = executor.submit(
                    aws_policy_crawling,
                    policy_key,
                    policy_value,
                    aws_policy_arn,
                    aws_policy_dict
                )
                futures.append(future)
            
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    logging.error(e, exc_info=True)

        if aws_policy_arn:
            save_json_to_aws_policies(f"AWS_POLICIES = {json.dumps(aws_policy_arn, indent=4)}\n", "aws_policies.py")
        if aws_policy_dict:
            save_json_to_aws_policies(f"AWS_POLICY_DICT = {json.dumps(aws_policy_dict, indent=4)}\n", "aws_policy_dict.py")
        logging.info("AWS managed policies has been updated!")