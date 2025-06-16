users = {
  "S13_UserA" = {
    inline_policies = {
      "S13_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["aiops:CreateInvestigation","iot:CreateThing"], Resource = "*" } ]
      })
    }
    managed_policies = [
      module.iam_policies["S13_AMP_PolicyA"].arn,
      module.iam_policies["S13_AMP_PolicyB"].arn
    ]
  }
}

groups = {
  "S13_GroupA" = {
    users = ["S13_UserA"]
    inline_policies = {
      "S13_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iam:ListRoles","s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"], Resource = "*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S13_AMP_PolicyC"].arn ]
  }
}

roles = {
  "S13_RoleA" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_user.S13_UserA.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S13_IP_RoleA" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListGroupsForUser","iam:ListAttachedUserPolicies","iam:GetUserPolicy"],Resource="*"}]}) }
    managed_policies = [ module.iam_policies["S13_AMP_PolicyD"].arn ]
  }
  "S13_RoleB" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_role.S13_RoleA.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S13_IP_RoleB" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListUserPolicies","iam:ListAttachedGroupPolicies","iam:GetRolePolicy"],Resource="*"}]}) }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonEKSServicePolicy", module.iam_policies["S13_AMP_PolicyE"].arn ]
  }
  "S13_RoleC" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_role.S13_RoleB.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S13_IP_RoleC" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["controltower:CreateManagedAccount","nimble:CreateStudio"],Resource="*"}]}) }
    managed_policies = [ module.iam_policies["S13_AMP_PolicyF"].arn ]
  }
  "S13_RoleD" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_role.S13_RoleC.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S13_IP_RoleD" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["tax:GetExemptions","s3-object-lambda:GetObjectAcl"],Resource="*"}]}) }
    managed_policies = [ module.iam_policies["S13_AMP_PolicyG"].arn ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S13_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iot:DeleteThing","bedrock:DeleteGuardrail"],Resource="*"}]})},
    "S13_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["bedrock:InvokeAgent","bedrock:UpdateFlow"],Resource="*"}]})},
    "S13_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["s3:ListBuckets","ec2:DescribeInstances"],Resource="*"}]})},
    "S13_AMP_PolicyD" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ssm:CancelCommand","codeguru:GetCodeGuruFreeTrialSummary"],Resource="*"}]})},
    "S13_AMP_PolicyE" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ec2:AllocateAddress","ec2:BundleInstance"],Resource="*"}]})},
    "S13_AMP_PolicyF" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListAttachedRolePolicies","iam:GetGroupPolicy","iam:ListGroupPolicies"],Resource="*"}]})},
    "S13_AMP_PolicyG" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListRolePolicies","iam:GetPolicyVersions"],Resource="*"}]})}
  }
)
