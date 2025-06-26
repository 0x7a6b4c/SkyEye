#!/usr/bin/env bash
set -euo pipefail

# USAGE: ./run-scenario.sh scenario1

SCENARIO="$1"
TIMEOUT_SEC=60   # 1 minutes

WORKDIR="$(cd "$(dirname "$0")" && pwd)"
SCENFILE="${WORKDIR}/scenarios/${SCENARIO}.tfvars"
if [ ! -f "$SCENFILE" ]; then
    echo "ERROR: Scenario file not found: $SCENFILE"
    exit 1
fi

TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
LOGDIR="${WORKDIR}/logs/${SCENARIO}-${TIMESTAMP}"
mkdir -p "$LOGDIR"

cd "$WORKDIR"

echo "→ [1/6] Initializing Terraform"
terraform init -input=false >/dev/null

echo "→ [2/6] Applying scenario: $SCENARIO"
terraform apply -auto-approve -input=false -var-file="$SCENFILE"

echo "→ [3/6] Extracting AWS credentials from Terraform output"
creds_json=$(terraform output -json user_credentials)
AWS_REGION=$(terraform output -raw region)

# Save creds_json as a pretty array for credentials.json
jq -n \
  --argjson creds "$creds_json" \
  --arg region "$AWS_REGION" '
    [$creds[] | {
      AccessKey: .access_key_id,
      SecretKey: .secret_access_key,
      SessionToken: "",
      Region: $region
    }]
  ' > "$WORKDIR/credentials.json"
echo "DEBUG: Saved credentials to $WORKDIR/credentials.json"

echo "DEBUG: creds_json is:"
echo "$creds_json" 

# Populate users array robustly
users=()
while IFS= read -r u; do
    [[ -n "$u" ]] && users+=("$u")
done < <(jq -r 'to_entries[] | select(.value.access_key_id != null and .value.access_key_id != "") | .key' <<<"$creds_json")

echo "DEBUG: users found: ${users[*]}"
declare -p users

if [[ ${#users[@]} -eq 0 ]]; then
    echo "ERROR: No users with credentials found!"
    exit 2
fi

TOOLS=(cloudfox cloudpeass enumerate-iam scoutsuite)
FAILED=0

for USER in "${users[@]}"; do
    USER=$(echo "$USER" | tr -d '\r\n'  | xargs)   # trim whitespace
    echo "DEBUG: Now processing user: '$USER'"

    AWS_ACCESS_KEY_ID=$(jq -r --arg u "$USER" '.[$u].access_key_id' <<<"$creds_json")
    AWS_SECRET_ACCESS_KEY=$(jq -r --arg u "$USER" '.[$u].secret_access_key' <<<"$creds_json")

    if [[ -z "$AWS_ACCESS_KEY_ID" || "$AWS_ACCESS_KEY_ID" == "null" ]]; then
        echo "  Skipping $USER: No credentials"
        continue
    fi

    echo "    User: $USER"
    echo "    AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
    echo "    AWS_REGION=$AWS_REGION"

    export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION

    # Write .env file for this user (tools expect .env, so copy per user)
    ENV_FILE="$WORKDIR/.env-$USER"
    cat > "$ENV_FILE" <<EOF
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
EOF

    echo "→ [4/6] Running tools as $USER ($TIMEOUT_SEC sec timeout per tool)"
    for TOOL in "${TOOLS[@]}"; do
        echo "  ... running $TOOL as $USER ..."
        LOG="$LOGDIR/${TOOL}-${USER}.log"
        set +e
        cp "$ENV_FILE" "$WORKDIR/.env"
        timeout $TIMEOUT_SEC docker compose run --rm $TOOL >"$LOG" 2>&1
        STATUS=$?
        set -e
        if [[ $STATUS -eq 124 ]]; then
            echo "  > $TOOL timed out after $TIMEOUT_SEC seconds (user: $USER)" | tee -a "$LOG"
            FAILED=1
        elif [[ $STATUS -ne 0 ]]; then
            echo "  > $TOOL failed (exit code $STATUS, user: $USER)" | tee -a "$LOG"
            FAILED=1
        else
            echo "  > $TOOL finished successfully (user: $USER)"
        fi
        rm -f "$WORKDIR/.env"
    done
    rm -f "$ENV_FILE"
done

echo "→ [5/6] Destroying scenario infra"
terraform destroy -auto-approve -var-file="$SCENFILE"

echo "→ [6/6] Cleanup"
rm -rf "$WORKDIR/.terraform" "$WORKDIR/terraform.tfstate" "$WORKDIR/terraform.tfstate.backup" "$WORKDIR/.terraform.lock.hcl"

echo
echo "===== SCAN COMPLETE ====="
echo "Log files are saved in: $LOGDIR"
if [[ $FAILED -ne 0 ]]; then
    echo "Some tools failed or timed out. See log files for details."
else
    echo "All tools ran successfully."
fi

echo
echo "===== USERS PROCESSED ====="
printf "%-25s %-40s\n" "User" "Log files"
for USER in "${users[@]}"; do
    printf "%-25s %-40s\n" "$USER" "${LOGDIR}/*-${USER}.log"
done

exit $FAILED
