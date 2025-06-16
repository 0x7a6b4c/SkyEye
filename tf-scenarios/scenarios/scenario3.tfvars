users = {
  "S3_UserA" = {
    inline_policies = {
      "S3_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect="Allow",Action=["iam:ListGroups","iam:ListAttachedUserPolicies","iam:GetUserPolicy"],Resource="*" } ]
      })
    }
    managed_policies = [
      module.iam_policies["S3_AMP_PolicyA"].arn,
      module.iam_policies["S3_AMP_PolicyB"].arn,
      module.iam_policies["S3_AMP_PolicyD"].arn
    ]
  }
}

groups = {
  "S3_GroupA" = {
    users = ["S3_UserA"]
    inline_policies = {
      "S3_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect="Allow",Action=["iam:ListRolePolicies","iam:GetPolicy"],Resource="*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S3_AMP_PolicyC"].arn ]
  }
}

roles = {
  "S3_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect="Allow",Principal={AWS=aws_iam_user.S3_UserA.arn},Action="sts:AssumeRole" } ]
    })
    inline_policies = {
      "S3_IP_RoleA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect="Allow",Action=["s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances","s3:ListBuckets","ec2:DescribeInstances"],Resource="*" } ]
      })
    }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess" ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S3_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListUserPolicies","iam:ListAttachedGroupPolicies","iam:GetRolePolicy"],Resource="*"}]} )},
    "S3_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:GetGroupPolicy","iam:ListGroupPolicies","iam:GetGroup"],Resource="*"}]} )},
    "S3_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:GetPolicyVersions","iam:ListAttachedRolePolicies","iam:ListRoles"],Resource="*"}]} )},
    "S3_AMP_PolicyD" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:CreateInvestigation","iot:CreateThing"],Resource="*"}]} )}
  }
)
