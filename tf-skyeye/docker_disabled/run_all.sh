#!/usr/bin/env bash
set -euo pipefail

# where we'll drop tool outputs
LOGDIR=${LOGDIR:-/opt/enum/logs}
mkdir -p "$LOGDIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "→ running CloudFox"
cloudfox whoami \
  --output json \
  > "$LOGDIR/cloudfox_whoami_${TIMESTAMP}.json"

echo "→ running enumerate-iam"
enumerate-iam list-users \
  --format json \
  > "$LOGDIR/enumerate-iam_list-users_${TIMESTAMP}.json"

echo "→ running PACU"
pacu.py \
  --output-file "$LOGDIR/pacu_snapshot_${TIMESTAMP}.json"

echo "→ running CloudPEASS"
cloudpeass \
  -o "$LOGDIR/cloudpeass_report_${TIMESTAMP}.html"

echo "→ running ScoutSuite"
scoutsuite aws \
  --report-dir "$LOGDIR/scoutsuite_${TIMESTAMP}"

echo "✅ all done, results in $LOGDIR"
