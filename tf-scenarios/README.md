Need to configure AWS CLI
aws configure

After configure AWS CLI, please init terraform
terraform init

If there were any updates for terraform files please validate
terraform validate

If validate succeed, please run plan
terraform plan -var-file="scenarios/<preffered_scenarios>.tfvars" -out=tfplan

if plan succeed, please run apply
terraform apply -var-file="scenarios/<preffered_scenarios>.tfvars" tfplan

For cleaning up, please run destroy
terraform destroy

Script if run in bash with deploy.sh scenario1 

#!/bin/bash
SCENARIO=${1:-scenario3}
terraform init
terraform plan -var-file="scenarios/${SCENARIO}.tfvars" -out=tfplan
terraform apply -var-file="scenarios/${SCENARIO}.tfvars"

=> then run in terminal ./deploy.sh scenario3


please run aws iam create-policy-version \
    --policy-arn arn:aws:iam:<aws account alias>:policy/<example policy> \
    --policy-document file://new_policy.json \
    --set-as-default

can run versioning with terraform for testing managed policy versioning then create module for policies

resource "aws_iam_policy" "this" {
  name   = var.name
  policy = jsonencode(var.document)
}