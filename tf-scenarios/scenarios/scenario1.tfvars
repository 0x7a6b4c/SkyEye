users = {
  "S1_UserA" = {
    inline_policies = {
      "S1_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          {
            Effect = "Allow",
            Action = [
              "iam:ListGroupsForUser",
              "iam:ListAttachedUserPolicies",
              "iam:GetUserPolicy"
            ],
            Resource = "*"
          }
        ]
      })
    }
    managed_policies = [
      module.iam_policies["S1_AMP_PolicyA"].arn,
      module.iam_policies["S1_AMP_PolicyB"].arn
    ]
  }
}

groups = {
  "S1_GroupA" = {
    users = ["S1_UserA"]
    inline_policies = {
      "S1_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          { Effect = "Allow", Action = ["iam:ListPolicyVersions","iam:ListRolePolicies"], Resource = "*" }
        ]
      })
    }
    managed_policies = [ module.iam_policies["S1_AMP_PolicyC"].arn ]
  }
}

roles = {
  "S1_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [
        { Effect = "Allow", Principal = { AWS = aws_iam_user.S1_UserA.arn }, Action = "sts:AssumeRole" }
      ]
    })
    inline_policies = {
      "S1_IP_RoleA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          { Effect = "Allow", Action = ["s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"], Resource = "*" }
        ]
      })
    }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonEKSServicePolicy" ]
  }
}

managed_policies = {
  "S1_AMP_PolicyA" = {
    description = "Scenario1 AMP Policy A"
    policy      = jsonencode({
      Version = "2012-10-17",
      Statement = [
        { Effect = "Allow", Action = ["iam:ListUserPolicies","iam:ListAttachedGroupPolicies","iam:GetRolePolicy"], Resource = "*" }
      ]
    })
  }
  "S1_AMP_PolicyB" = {
    description = "Scenario1 AMP Policy B"
    policy      = jsonencode({
      Version = "2012-10-17",
      Statement = [
        { Effect = "Allow", Action = ["iam:GetGroupPolicy","iam:ListGroupPolicies"], Resource = "*" }
      ]
    })
  }
  "S1_AMP_PolicyC" = {
    description = "Scenario1 AMP Policy C"
    policy      = jsonencode({
      Version = "2012-10-17",
      Statement = [
        { Effect = "Allow", Action = ["iam:GetPolicyVersions","iam:ListAttachedRolePolicies","iam:ListRoles"], Resource = "*" }
      ]
    })
  }
}
