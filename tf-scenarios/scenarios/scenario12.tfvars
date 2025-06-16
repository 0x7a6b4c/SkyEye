users = {
  "S12_UserA" = {
    inline_policies = {
      "S12_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect="Allow",Action=["aiops:CreateInvestigation","iot:CreateThing"],Resource="*"} ]
      })
    }
    managed_policies = [ module.iam_policies["S12_AMP_PolicyA"].arn, module.iam_policies["S12_AMP_PolicyB"].arn ]
  }
}

groups = {
  "S12_GroupA" = {
    users = ["S12_UserA"]
    inline_policies = {
      "S12_IP_GroupA" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListRoles","s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"],Resource="*"}]})
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy", module.iam_policies["S12_AMP_PolicyC"].arn]
  }
}

roles = {
  "S12_RoleA" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_user.S12_UserA.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S12_IP_RoleA" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListGroupsForUser","iam:GetUserPolicy","iam:ListUserPolicies","iam:GetRolePolicy","iam:ListEntitiesForPolicy","iam:ListPolicies"],Resource="*"}]}) }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess", module.iam_policies["S12_AMP_PolicyD"].arn ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S12_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iot:DeleteThing","bedrock:DeleteGuardrail"],Resource="*"}]})},
    "S12_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["bedrock:InvokeAgent","bedrock:UpdateFlow"],Resource="*"}]})},
    "S12_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["s3:ListBuckets","ec2:DescribeInstances"],Resource="*"}]})},
    "S12_AMP_PolicyD" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:GetGroupPolicy","iam:ListGroupPolicies","iam:ListRolePolicies","iam:GetPolicyVersions"],Resource="*"}]})}
  }
)