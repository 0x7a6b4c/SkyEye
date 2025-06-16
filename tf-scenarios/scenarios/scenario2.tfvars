users = {
  "S2_UserA" = {
    inline_policies = {
      "S2_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          { Effect = "Allow", Action = ["iam:ListGroups","iam:ListAttachedUserPolicies","iam:GetUserPolicy"], Resource = "*" }
        ]
      })
    }
    managed_policies = [
      module.iam_policies["S2_AMP_PolicyA"].arn,
      module.iam_policies["S2_AMP_PolicyB"].arn,
      module.iam_policies["S2_AMP_PolicyC"].arn
    ]
  }
}

groups = {
  "S2_GroupA" = {
    users = ["S2_UserA"]
    inline_policies = {
      "S2_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          { Effect = "Allow", Action = ["iam:ListPolicyVersions","iam:ListRolePolicies"], Resource = "*" }
        ]
      })
    }
    managed_policies = [ module.iam_policies["S2_AMP_PolicyD"].arn ]
  }
}

roles = {
  "S2_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_user.S2_UserA.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S2_IP_RoleA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          { Effect = "Allow", Action = ["s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances","s3:ListBuckets","ec2:DescribeInstances"], Resource = "*" }
        ]
      })
    }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonS3TablesFullAccess" ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S2_AMP_PolicyA" = { description = "", policy = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListUserPolicies","iam:ListAttachedGroupPolicies","iam:GetRolePolicy"],Resource="*"}]} )},
    "S2_AMP_PolicyB" = { description = "", policy = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:GetGroupPolicy","iam:ListGroupPolicies","iam:GetGroup"],Resource="*"}]} )},
    "S2_AMP_PolicyC" = { description = "", policy = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:CreateInvestigation","iot:CreateThing"],Resource="*"}]} )},
    "S2_AMP_PolicyD" = { description = "", policy = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:GetPolicyVersions","iam:ListAttachedRolePolicies","iam:ListRoles"],Resource="*"}]} )}
  }
)