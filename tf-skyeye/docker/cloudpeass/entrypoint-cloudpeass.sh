#!/bin/sh
set -e

# write out a creds file for "default" profile
mkdir -p /root/.aws
cat > /root/.aws/credentials <<EOF
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
EOF

# launch CloudPEASS (installed as AWSPEAS.py in /opt/cloudpeass)
exec python3 /opt/cloudpeass/AWSPEAS.py \
     --profile default \
     --region "${AWS_REGION:-ap-southeast-1}"

