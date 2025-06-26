#!/bin/sh
set -e

echo "Entrypoint invoked as: $0 $@"
echo "All environment variables:"
env
echo "---"

if [ "$#" -ne 0 ]; then
  echo "ERROR: This container does not accept arguments. Received: $@"
  exit 2
fi

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_REGION" ]; then
  echo "AWS credentials or region not set. Exiting."
  exit 1
fi

echo "AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY"
echo "AWS_REGION: $AWS_REGION"

exec pacu \
  --set-keys "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY" \
  --set-regions "$AWS_REGION" \
  --module-name iam__enum_permissions \
  --exec
