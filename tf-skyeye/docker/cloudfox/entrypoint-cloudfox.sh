#!/bin/sh
set -e

# write AWS credentials
mkdir -p /root/.aws
cat > /root/.aws/credentials <<EOF
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
EOF

# write default region
cat > /root/.aws/config <<EOF
[default]
region = ${AWS_REGION}
EOF

# run Cloudfox against that profile in non-interactive mode
exec cloudfox aws all-checks --yes --profile default
