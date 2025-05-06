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

import json
import requests
import logging
import re
import os
from collections import OrderedDict

IAM_RISK_OPERATIONS = {
  "iam:PassRole": "privesc-vector",
  "codebuild:CreateProject": "privesc-vector",
  "codebuild:UpdateProject": "privesc-vector",
  "codepipeline:CreatePipeline": "privesc-vector",
  "codepipeline:StartPipelineExecution": "privesc-vector",
  "codepipeline:UpdatePipeline": "privesc-vector",
  "codestar:CreateProject": "privesc-vector",
  "codestar:AssociateTeamMember": "privesc-vector",
  "codestar:CreateProjectFromTemplate": "privesc-vector",
  "cloudformation:CreateStack": "privesc-vector",
  "cloudformation:UpdateStack": "privesc-vector",
  "cloudformation:SetStackPolicy": "privesc-vector",
  "cloudformation:CreateChangeSet": "privesc-vector",
  "cloudformation:ExecuteChangeSet": "privesc-vector",
  "cloudformation:CreateStackSet": "privesc-vector",
  "cloudformation:UpdateStackSet": "privesc-vector",
  "cognito-identity:SetIdentityPoolRoles": "privesc-vector",
  "cognito-identity:update-identity-pool": "privesc-vector",
  "cognito-idp:AdminAddUserToGroup": "privesc-vector",
  "cognito-idp:CreateGroup": "privesc-vector",
  "cognito-idp:UpdateGroup": "privesc-vector",
  "cognito-idp:AdminConfirmSignUp": "privesc-vector",
  "cognito-idp:AdminCreateUser": "privesc-vector",
  "cognito-idp:AdminEnableUser": "privesc-vector",
  "cognito-idp:AdminInitiateAuth": "privesc-vector",
  "cognito-idp:AdminRespondToAuthChallenge": "privesc-vector",
  "cognito-idp:AdminSetUserPassword": "privesc-vector",
  "cognito-idp:CreateUserImportJob": "privesc-vector",
  "cognito-idp:StartUserImportJob": "privesc-vector",
  "cognito-idp:CreateIdentityProvider": "privesc-vector",
  "cognito-idp:UpdateIdentityProvider": "privesc-vector",
  "datapipeline:CreatePipeline": "privesc-vector",
  "datapipeline:PutPipelineDefinition": "privesc-vector",
  "datapipeline:ActivatePipeline": "privesc-vector",
  "ec2:RunInstances": "high",
  "iam:AddRoleToInstanceProfile": "privesc-vector",
  "ec2:RequestSpotInstances": "privesc-vector",
  "ec2:ModifyInstanceAttribute": "privesc-vector",
  "ec2:CreateLaunchTemplateVersion": "privesc-vector",
  "ec2:CreateLaunchTemplate": "privesc-vector",
  "ec2:ModifyLaunchTemplate": "privesc-vector",
  "autoscaling:CreateLaunchConfiguration": "privesc-vector",
  "autoscaling:CreateAutoScalingGroup": "privesc-vector",
  "ec2-instance-connect:SendSSHPublicKey": "privesc-vector",
  "ec2-instance-connect:SendSerialConsoleSSHPublicKey": "privesc-vector",
  "ecs:RegisterTaskDefinition": "privesc-vector",
  "ecs:RunTask": "privesc-vector",
  "ecs:StartTask": "privesc-vector",
  "ecs:CreateService": "privesc-vector",
  "ecs:UpdateService": "privesc-vector",
  "ecs:ExecuteCommand": "privesc-vector",
  "ecs:DescribeTasks": "privesc-vector",
  "elasticbeanstalk:CreateApplication": "privesc-vector",
  "elasticbeanstalk:CreateEnvironment": "privesc-vector",
  "elasticbeanstalk:CreateApplicationVersion": "privesc-vector",
  "elasticbeanstalk:UpdateEnvironment": "privesc-vector",
  "cloudformation:GetTemplate": "privesc-vector",
  "cloudformation:DescribeStackResources": "privesc-vector",
  "cloudformation:DescribeStackResource": "privesc-vector",
  "autoscaling:DescribeAutoScalingGroups": "privesc-vector",
  "autoscaling:SuspendProcesses": "privesc-vector",
  "elasticmapreduce:RunJobFlow": "privesc-vector",
  "elasticmapreduce:CreateEditor": "privesc-vector",
  "iam:ListRoles": "privesc-vector",
  "elasticmapreduce:ListClusters": "privesc-vector",
  "elasticmapreduce:DescribeEditor": "privesc-vector",
  "elasticmapreduce:OpenEditorInConsole": "privesc-vector",
  "glue:CreateDevEndpoint": "privesc-vector",
  "glue:UpdateDevEndpoint": "privesc-vector",
  "glue:CreateJob": "privesc-vector",
  "glue:StartJobRun": "privesc-vector",
  "glue:CreateTrigger": "privesc-vector",
  "glue:UpdateJob": "privesc-vector",
  "iam:CreatePolicyVersion": "privesc-vector",
  "iam:SetDefaultPolicyVersion": "privesc-vector",
  "iam:CreateAccessKey": "privesc-vector",
  "iam:CreateLoginProfile": "privesc-vector",
  "iam:UpdateLoginProfile": "privesc-vector",
  "iam:CreateServiceSpecificCredential": "privesc-vector",
  "iam:ResetServiceSpecificCredential": "privesc-vector",
  "iam:AttachUserPolicy": "privesc-vector",
  "iam:AttachGroupPolicy": "privesc-vector",
  "iam:AttachRolePolicy": "privesc-vector",
  "iam:PutUserPolicy": "privesc-vector",
  "iam:PutGroupPolicy": "privesc-vector",
  "iam:PutRolePolicy": "privesc-vector",
  "iam:AddUserToGroup": "privesc-vector",
  "iam:UpdateAssumeRolePolicy": "privesc-vector",
  "iam:UploadSSHPublicKey": "privesc-vector",
  "iam:DeactivateMFADevice": "privesc-vector",
  "iam:ResyncMFADevice": "privesc-vector",
  "iam:UpdateSAMLProvider": "privesc-vector",
  "iam:ListSAMLProviders": "privesc-vector",
  "iam:UpdateOpenIDConnectProviderThumbprint": "privesc-vector",
  "iam:ListOpenIDConnectProviders": "privesc-vector",
  "lambda:CreateFunction": "privesc-vector",
  "lambda:InvokeFunction": "privesc-vector",
  "lambda:InvokeFunctionUrl": "privesc-vector",
  "lambda:AddPermission": "privesc-vector",
  "lambda:CreateEventSourceMapping": "privesc-vector",
  "lambda:UpdateFunctionCode": "privesc-vector",
  "lambda:UpdateFunctionConfiguration": "privesc-vector",
  "identitystore:CreateGroupMembership": "privesc-vector",
  "sso:PutInlinePolicyToPermissionSet": "privesc-vector",
  "sso:ProvisionPermissionSet": "privesc-vector",
  "sso:AttachManagedPolicyToPermissionSet": "privesc-vector",
  "sso:AttachCustomerManagedPolicyToPermissionSet": "privesc-vector",
  "sso:CreateAccountAssignment": "privesc-vector",
  "sagemaker:CreateNotebookInstance": "privesc-vector",
  "sagemaker:CreatePresignedNotebookInstanceUrl": "privesc-vector",
  "sagemaker:CreateProcessingJob": "privesc-vector",
  "sagemaker:CreateTrainingJob": "privesc-vector",
  "sagemaker:CreateHyperParameterTuningJob": "privesc-vector",
  "ssm:SendCommand": "privesc-vector",
  "ssm:StartSession": "privesc-vector",
  "ssm:ResumeSession": "privesc-vector",
  "sts:AssumeRole": "privesc-vector",
  "sts:AssumeRoleWithSAML": "privesc-vector",
  "sts:AssumeRoleWithWebIdentity": "privesc-vector",
  "apigateway:POST": "high",
  "apigateway:GET": "high",
  "apigateway:UpdateGatewayResponse": "high",
  "apigateway:CreateDeployment": "high",
  "apigateway:UpdateStage": "high",
  "apigateway:PutMethodResponse": "high",
  "apigateway:UpdateRestApi": "high",
  "apigateway:CreateApiKey": "high",
  "apigateway:UpdateApiKey": "high",
  "apigateway:CreateUsagePlan": "high",
  "apigateway:CreateUsagePlanKey": "high",
  "apigateway:UpdateRestApiPolicy": "high",
  "apigateway:PATCH": "high",
  "chime:CreateApiKey": "high",
  "codebuild:DeleteProject": "high",
  "codebuild:DeleteSourceCredentials": "high",
  "codepipeline:pollforjobs": "high",
  "cognito-idp:AdminSetUserSettings": "high",
  "cognito-idp:SetUserMFAPreference": "high",
  "cognito-idp:SetUserPoolMfaConfig": "high",
  "cognito-idp:UpdateUserPool": "high",
  "cognito-idp:AdminUpdateUserAttributes": "high",
  "cognito-idp:CreateUserPoolClient": "high",
  "cognito-idp:UpdateUserPoolClient": "high",
  "ds:ResetUserPassword": "high",
  "dynamodb:BatchGetItem": "high",
  "dynamodb:GetItem": "high",
  "dynamodb:Query": "high",
  "dynamodb:Scan": "high",
  "dynamodb:PartiQLSelect": "high",
  "dynamodb:ExportTableToPointInTime": "high",
  "dynamodb:CreateTable": "high",
  "dynamodb:RestoreTableFromBackup": "high",
  "dynamodb:PutItem": "high",
  "dynamodb:UpdateItem": "high",
  "dynamodb:DeleteTable": "high",
  "dynamodb:DeleteBackup": "high",
  "ebs:ListSnapshotBlocks": "high",
  "ebs:GetSnapshotBlock": "high",
  "ec2:DescribeSnapshots": "high",
  "ec2:CreateSnapshot": "high",
  "EC2:DescribeVolumes": "high",
  "DLM:CreateLifeCyclePolicy": "high",
  "ec2:DescribeInstances": "high",
  "ec2:CreateSecurityGroup": "high",
  "ec2:AuthorizeSecurityGroupIngress": "high",
  "ec2:CreateTrafficMirrorTarget": "high",
  "ec2:CreateTrafficMirrorSession": "high",
  "ec2:CreateTrafficMirrorFilter": "high",
  "ec2:CreateTrafficMirrorFilterRule": "high",
  "ecr:GetAuthorizationToken": "high",
  "ecr:BatchGetImage": "high",
  "ecr:BatchCheckLayerAvailability": "high",
  "ecr:CompleteLayerUpload": "high",
  "ecr:InitiateLayerUpload": "high",
  "ecr:PutImage": "high",
  "ecr:UploadLayerPart": "high",
  "ecr:SetRepositoryPolicy": "high",
  "ecr:PutRegistryPolicy": "high",
  "ecr:PutLifecyclePolicy": "high",
  "ecr:DeleteRepository": "high",
  "ecr-public:DeleteRepository": "high",
  "ecr:BatchDeleteImage": "high",
  "ecr-public:BatchDeleteImage": "high",
  "elasticfilesystem:DeleteFileSystemPolicy": "high",
  "elasticfilesystem:PutFileSystemPolicy": "high",
  "elasticfilesystem:ClientMount": "high",
  "elasticfilesystem:CreateMountTarget": "high",
  "elasticfilesystem:ModifyMountTargetSecurityGroups": "high",
  "elasticfilesystem:DeleteMountTarget": "high",
  "elasticfilesystem:DeleteFileSystem": "high",
  "elasticfilesystem:UpdateFileSystem": "high",
  "elasticfilesystem:CreateAccessPoint": "high",
  "elasticfilesystem:DeleteAccessPoint": "high",
  "elasticbeanstalk:DeleteApplicationVersion": "high",
  "elasticbeanstalk:TerminateEnvironment": "high",
  "elasticbeanstalk:DeleteApplication": "high",
  "gamelift:RequestUploadCredentials": "high",
  "kms:PutKeyPolicy": "high",
  "kms:CreateGrant": "high",
  "kms:CreateKey": "high",
  "kms:ReplicateKey": "high",
  "kms:Decrypt": "high",
  "lambda:AddLayerVersionPermission": "high",
  "lightsail:DownloadDefaultKeyPair": "high",
  "lightsail:GetInstanceAccessDetails": "high",
  "lightsail:GetRelationalDatabaseMasterUserPassword": "high",
  "lightsail:UpdateRelationalDatabase": "high",
  "lightsail:OpenInstancePublicPorts": "high",
  "lightsail:PutInstancePublicPorts": "high",
  "lightsail:SetResourceAccessForBucket": "high",
  "lightsail:CreateBucketAccessKey": "high",
  "lightsail:UpdateBucket": "high",
  "lightsail:UpdateContainerService": "high",
  "lightsail:CreateDomainEntry": "high",
  "lightsail:UpdateDomainEntry": "high",
  "mediapackage:RotateChannelCredentials": "high",
  "mediapackage:RotateIngestEndpointCredentials": "high",
  "mq:ListBrokers": "high",
  "mq:CreateUser": "high",
  "mq:ListUsers": "high",
  "mq:UpdateUser": "high",
  "mq:UpdateBroker": "high",
  "msk:ListClusters": "high",
  "msk:UpdateSecurity": "high",
  "rds:ModifyDBInstance": "high",
  "rds:CreateDBSnapshot": "high",
  "rds:RestoreDBInstanceFromDBSnapshot": "high",
  "rds-db:connect": "high",
  "rds:DownloadDBLogFilePortion": "high",
  "rds:DeleteDBInstance": "high",
  "rds:StartExportTask": "high",
  "redshift:DescribeClusters": "high",
  "redshift:GetClusterCredentials": "high",
  "redshift:GetClusterCredentialsWithIAM": "high",
  "redshift:ModifyCluster": "high",
  "route53:CreateHostedZone": "high",
  "route53:ChangeResourceRecordSets": "high",
  "acm-pca:IssueCertificate": "high",
  "acm-pca:GetCertificate": "high",
  "sns:DeleteTopic": "high",
  "sns:Publish": "high",
  "sns:SetTopicAttributes": "high",
  "sns:Subscribe": "high",
  "sns:Unsubscribe": "high",
  "sns:AddPermission": "high",
  "sns:RemovePermission": "high",
  "sqs:AddPermission": "high",
  "sqs:SendMessage": "high",
  "sqs:SendMessageBatch": "high",
  "sqs:ReceiveMessage": "high",
  "sqs:DeleteMessage": "high",
  "sqs:ChangeMessageVisibility": "high",
  "sqs:DeleteQueue": "high",
  "sqs:PurgeQueue": "high",
  "sqs:RemovePermission": "high",
  "s3:PutObject": "high",
  "s3:GetObject": "high",
  "s3:PutBucketPolicy": "high",
  "s3:PutBucketAcl": "high",
  "s3:PutObjectVersionAcl": "high",
  "secretsmanager:GetSecretValue": "high",
  "secretsmanager:PutResourcePolicy": "high",
  "ssm:DescribeParameters": "high",
  "ssm:ListCommands": "high",
  "ssm:GetCommandInvocation": "high",
  "workdocs:CreateUser": "high",
  "workdocs:GetDocument": "high",
  "workdocs:AddResourcePermissions": "high",
  "workdocs:AddUserToGroup": "high"
}

def update_iam_operations():
    logging.info("Updating [Resource] AWS Boto3 IAM Read-Only Operations...")
    IAM_READ_OPERATION_LIST = dict()
    url = "https://awspolicygen.s3.amazonaws.com/js/policies.js"
    file_name = "boto3_iam_operations.py"

    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        logging.error(f"Failed to update the boto3 iam operations: {e}")
    else:
        aws_operations = json.loads(response.text.replace("app.PolicyEditorConfig=", ""))

    for service in aws_operations['serviceMap'].values():
        if service['StringPrefix'] not in IAM_READ_OPERATION_LIST:
            IAM_READ_OPERATION_LIST[service['StringPrefix']] = [re.sub(r'(?<!^)(?=[A-Z])', '_', item).lower() for item in service['Actions'] if item.startswith(("List", "Get", "Describe"))
    ]

    if IAM_READ_OPERATION_LIST:
        merged_library_filename = os.path.join("resources/libraries", file_name)
        with open(merged_library_filename, 'w') as outfile:
            outfile.write(f"IAM_READ_OPERATION_LIST = {json.dumps(IAM_READ_OPERATION_LIST, indent=4)}\n")

    logging.info("AWS Boto3 IAM Read-Only Operations has been updated!")

    update_sensitive_permissions_library(aws_operations)


def update_sensitive_permissions_library(aws_operations):
    logging.info("Updating [Resource] AWS IAM Sensitive Operations Library...")
    IAM_R_OPERATION_LIST = dict()
    IAM_M_OPERATION_LIST = dict()
    file_name = "iam_sensitive_operations.json"
    IAM_SENSITIVE_OPERATIONS = OrderedDict()

    for service in aws_operations['serviceMap'].values():
        if service['StringPrefix'] not in IAM_R_OPERATION_LIST:
            IAM_R_OPERATION_LIST[service['StringPrefix']] = [f"{service['StringPrefix']}:{item}" for item in service['Actions'] if item.startswith(("List", "Get", "Describe")) ]
    
    for service in aws_operations['serviceMap'].values():
        if service['StringPrefix'] not in IAM_M_OPERATION_LIST:
            IAM_M_OPERATION_LIST[service['StringPrefix']] = [f"{service['StringPrefix']}:{item}" for item in service['Actions'] if not item.startswith(("List", "Get", "Describe")) ]

    for service, operations in IAM_M_OPERATION_LIST.items():
        for operation in operations:
            IAM_SENSITIVE_OPERATIONS[operation] = "medium"

    for service, operations in IAM_R_OPERATION_LIST.items():
        for operation in operations:
            IAM_SENSITIVE_OPERATIONS[operation] = "low"

    for perm, risk_level in IAM_RISK_OPERATIONS.items():
        IAM_SENSITIVE_OPERATIONS[perm] = risk_level
    
    if IAM_SENSITIVE_OPERATIONS:
        merged_library_filename = os.path.join("resources/libraries", file_name)
        with open(merged_library_filename, 'w') as outfile:
            outfile.write(json.dumps(IAM_SENSITIVE_OPERATIONS, indent=4))

    logging.info("AWS IAM Sensitive Operations Library has been updated!")