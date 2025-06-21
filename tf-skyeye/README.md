# Need to configure AWS CLI
aws configure

# After configure AWS CLI, please init terraform
terraform init

# If there were any updates for terraform files please validate
terraform validate

# If validate succeed, please run plan
terraform plan -var-file="scenarios/<preffered_scenarios>.tfvars" -out=tfplan

# if plan succeed, please run apply
terraform apply -var-file="scenarios/<preffered_scenarios>.tfvars" tfplan

# For cleaning up, please run destroy
terraform destroy

# Script if run in bash with deploy.sh scenario1 

#!/bin/bash
SCENARIO=${1:-scenario3}
terraform init
terraform plan -var-file="scenarios/${SCENARIO}.tfvars" -out=tfplan
terraform apply -var-file="scenarios/${SCENARIO}.tfvars"

# => then run in terminal ./deploy.sh scenario3

---

# For tool comparison of 5 others using docker

# Build once
docker build -t iam-enum-tools -f docker/Dockerfile docker/.

# For each scenario:
1. terraform apply -var-file=scenarioX.tfvars
#    (capture ACCESS_KEY_ID / SECRET_ACCESS_KEY from your terraform output)
2. Run container with those creds and a bind mount for logs:
docker run --rm \
  -e AWS_ACCESS_KEY_ID=XXXX \
  -e AWS_SECRET_ACCESS_KEY=XXXX \
  -v "$(pwd)/scenarioX-logs:/opt/enum/logs" \
  iam-enum-tools

3, Inspect logs in ./scenarioX-logs
4. terraform destroy -var-file=scenarioX.tfvars

# Please refer to the bashscript run-scenario.sh for re-usability (though would need to install jq first)
./run-scenario.sh scenario1