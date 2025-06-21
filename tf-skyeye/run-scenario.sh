#!/usr/bin/env bash
set -euo pipefail

# USAGE: ./run-scenario-and-tools.sh scenario1

SCENARIO="$1"
TIMEOUT_SEC=120   # 2 minutes

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
AWS_ACCESS_KEY_ID=$(jq -r 'to_entries[0].value.access_key_id' <<<"$creds_json")
AWS_SECRET_ACCESS_KEY=$(jq -r 'to_entries[0].value.secret_access_key' <<<"$creds_json")
AWS_REGION=$(terraform output -raw region)

echo "    AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "    AWS_REGION=$AWS_REGION"

export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION

# Write .env file for docker
cat > "$WORKDIR/.env" <<EOF
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
EOF

echo "→ [4/6] Running tools with $TIMEOUT_SEC sec timeout per tool"

TOOLS=(cloudfox cloudpeass enumerate-iam scoutsuite)
FAILED=0

for TOOL in "${TOOLS[@]}"; do
    echo "  ... running $TOOL ..."
    LOG="$LOGDIR/${TOOL}.log"
    set +e
    timeout $TIMEOUT_SEC docker compose run --rm $TOOL >"$LOG" 2>&1
    STATUS=$?
    set -e
    if [[ $STATUS -eq 124 ]]; then
        echo "  > $TOOL timed out after $TIMEOUT_SEC seconds" | tee -a "$LOG"
        FAILED=1
    elif [[ $STATUS -ne 0 ]]; then
        echo "  > $TOOL failed (exit code $STATUS)" | tee -a "$LOG"
        FAILED=1
    else
        echo "  > $TOOL finished successfully"
    fi
done

echo "→ [5/6] Destroying scenario infra"
terraform destroy -auto-approve -var-file="$SCENFILE"

echo "→ [6/6] Cleanup"
rm -f "$WORKDIR/.env"
rm -rf "$WORKDIR/.terraform" "$WORKDIR/terraform.tfstate" "$WORKDIR/terraform.tfstate.backup" "$WORKDIR/.terraform.lock.hcl"

echo
echo "===== SCAN COMPLETE ====="
echo "Log files are saved in: $LOGDIR"
if [[ $FAILED -ne 0 ]]; then
    echo "Some tools failed or timed out. See log files for details."
else
    echo "All tools ran successfully."
fi
exit $FAILED
