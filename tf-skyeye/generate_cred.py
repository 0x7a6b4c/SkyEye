import subprocess
import os
import json
import sys

def run_terraform_output(output_var, raw=False):
    cmd = ["terraform", "output"]
    if raw:
        cmd.append("-raw")
    else:
        cmd.append("-json")
    cmd.append(output_var)
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running {' '.join(cmd)}:")
        print(e.stderr)
        sys.exit(1)

def main():
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    credentials_path = os.path.join(parent_dir, "credentials.json")

    # Run terraform to get user_credentials and region
    print("Extracting user_credentials from Terraform output...")
    creds_json_str = run_terraform_output("user_credentials", raw=False)
    print("Extracting region from Terraform output...")
    region = run_terraform_output("region", raw=True)

    # Parse credentials JSON
    try:
        creds_json = json.loads(creds_json_str)
    except Exception as e:
        print("Failed to parse user_credentials as JSON!")
        print(creds_json_str)
        raise

    # Convert to desired format (list of dicts)
    output = []
    for u in creds_json:
        if not creds_json[u].get("access_key_id"):
            continue
        output.append({
            "AccessKey": creds_json[u].get("access_key_id"),
            "SecretKey": creds_json[u].get("secret_access_key"),
            "SessionToken": "",
            "Region": region
        })

    # Save as credentials.json one folder up
    with open(credentials_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Saved credentials.json to {credentials_path}")

if __name__ == "__main__":
    main()
