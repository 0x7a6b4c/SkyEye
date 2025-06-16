users = {
  "S15_UserA" = { inline_policies = { "S15_IP_UserA" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListGroupsForUser","iam:ListAttachedUserPolicies","iam:GetUserPolicy"],Resource="*"}]})} , managed_policies = [ module.iam_policies["S15_AMP_PolicyA"].arn, module.iam_policies["S15_AMP_PolicyB"].arn ] }
  "S15_UserB" = { inline_policies = { "S15_IP_UserB" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListUserPolicies","iam:ListAttachedGroupPolicies","iam:GetRolePolicy"],Resource="*"}]})} , managed_policies = [ module.iam_policies["S15_AMP_PolicyD"].arn ] }
  "S15_UserC" = { inline_policies = { "S15_IP_UserC" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["sdb:BatchPutAttributes","nimble:CreateStudio"],Resource="*"}]})} , managed_policies = [ module.iam_policies["S15_AMP_PolicyF"].arn ] }
  "S15_UserD" = { inline_policies = { "S15_IP_UserD" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["codecatalyst:CreateIdentityCenterApplication","codedeploy:UpdateApplication"],Resource="*"}]})} , managed_policies = [ module.iam_policies["S15_AMP_PolicyY"].arn ] }
}

groups = {
  "S15_UserA_GroupA" = { users=["S15_UserA"], inline_policies={ "S15_IP_UserA_GroupA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListRoles","s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"],Resource="*"}]})}, managed_policies=[ module.iam_policies["S15_AMP_PolicyC"].arn ] }
  "S15_UserB_GroupA" = { users=["S15_UserB"], inline_policies={ "S15_IP_UserB_GroupA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListPolicyVersions"],Resource="*"}]})}, managed_policies=[ module.iam_policies["S15_AMP_PolicyX"].arn ] }
  "S15_UserC_GroupA" = { users=["S15_UserC"], inline_policies={ "S15_IP_UserC_GroupA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["tax:GetExemptions","s3-object-lambda:GetObjectAcl"],Resource="*"}]})}, managed_policies=[ module.iam_policies["S15_AMP_PolicyG"].arn ] }
  "S15_UserD_GroupA" = { users=["S15_UserD"], inline_policies={ "S15_IP_UserD_GroupA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iotanalytics:CreatePipeline","aiops:CreateInvestigationResource"],Resource="*"}]})}, managed_policies=[ module.iam_policies["S15_AMP_PolicyU"].arn ] }
}

roles = {
  "S15_UserA_RoleA" = { assume_role_policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_user.S15_UserA.arn},Action="sts:AssumeRole"}]}), inline_policies={ "S15_IP_UserA_RoleA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ec2:AllocateAddress","controltower:CreateManagedAccount"],Resource="*"}]})}, managed_policies=[ module.iam_policies["S15_AMP_PolicyT"].arn ] }
  "S15_UserB_RoleA" = { assume_role_policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_user.S15_UserB.arn},Action="sts:AssumeRole"}]}), inline_policies={ "S15_IP_UserB_RoleA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ram:CreatePermission","ec2:BundleInstance"],Resource="*"}]})}, managed_policies=[ "arn:aws:iam::aws:policy/AmazonEKSServicePolicy", module.iam_policies["S15_AMP_PolicyE"].arn ] }
  "S15_UserC_RoleA" = { assume_role_policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_user.S15_UserC.arn},Action="sts:AssumeRole"}]}), inline_policies={ "S15_IP_UserC_RoleA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ram:CreateResourceShare","scn:DescribeInstance"],Resource="*"}]})}, managed_policies=[] }
  "S15_UserD_RoleA" = { assume_role_policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_user.S15_UserD.arn},Action="sts:AssumeRole"}]}), inline_policies={ "S15_IP_UserD_RoleA"=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ram:PromotePermissionCreatedFromPolicy","scn:CreateBillOfMaterialsImportJob"],Resource="*"}]})}, managed_policies=[ "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess", module.iam_policies["S15_AMP_PolicyZ"].arn ] }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S15_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iot:DeleteThing","bedrock:DeleteGuardrail"],Resource="*"}]})},
    "S15_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["bedrock:InvokeAgent","bedrock:UpdateFlow"],Resource="*"}]})},
    "S15_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["private-networks:ActivateDeviceIdentifier","auditmanager:UpdateAssessment"],Resource="*"}]})},
    "S15_AMP_PolicyD" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["codecatalyst:DeleteConnection","codeguru:GetCodeGuruFreeTrialSummary"],Resource="*"}]})},
    "S15_AMP_PolicyE" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["s3:ListBuckets","ec2:DescribeInstances"],Resource="*"}]})},
    "S15_AMP_PolicyF" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListAttachedRolePolicies","iam:GetGroupPolicy","iam:ListGroupPolicies"],Resource="*"}]})},
    "S15_AMP_PolicyG" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListRolePolicies","iam:GetPolicyVersions"],Resource="*"}]})},
    "S15_AMP_PolicyT" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ssm:CancelCommand","globalaccelerator:CreateAccelerator"],Resource="*"}]})},
    "S15_AMP_PolicyX" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["globalaccelerator:DeleteAccelerator","codedeploy:BatchGetApplications"],Resource="*"}]})},
    "S15_AMP_PolicyY" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ram:GetPermission","scn:CreateDataLakeDataset"],Resource="*"}]})},
    "S15_AMP_PolicyU" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iotanalytics:DescribeChannel","codedeploy:CreateDeployment"],Resource="*"}]})},
    "S15_AMP_PolicyZ" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iotanalytics:DeleteDataset","qapps:CreateLibraryItemReview"],Resource="*"}]})}
  }
)