managed_policies = {
  "S2_AMP_PolicyA" = {
    description = "ListUserPolicies, ListAttachedGroupPolicies, GetRolePolicy"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:ListUserPolicies",
          "iam:ListAttachedGroupPolicies",
          "iam:GetRolePolicy"
        ]
        Resource = "*"
      }]
    }
  }
  "S2_AMP_PolicyB" = {
    description = "GetGroupPolicy, ListGroupPolicies, GetGroup"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:GetGroupPolicy",
          "iam:ListGroupPolicies",
          "iam:GetGroup"
        ]
        Resource = "*"
      }]
    }
  }
  "S2_AMP_PolicyC" = {
    description = "CreateInvestigation & CreateThing"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "aiops:CreateInvestigation",
          "iot:CreateThing"
        ]
        Resource = "*"
      }]
    }
  }
  "S2_AMP_PolicyD" = {
    description = "GetPolicyVersions, ListAttachedRolePolicies, ListRoles"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:GetPolicyVersions",
          "iam:ListAttachedRolePolicies",
          "iam:ListRoles"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S2_UserA" = {
    inline_policies = {
      "S2_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListGroups",
            "iam:ListAttachedUserPolicies",
            "iam:GetUserPolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "S2_AMP_PolicyA",
      "S2_AMP_PolicyB",
      "S2_AMP_PolicyC"
    ]
  }
}

groups = {
  "S2_GroupA" = {
    users           = ["S2_UserA"]
    inline_policies = {
      "S2_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListPolicyVersions",
            "iam:ListRolePolicies"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S2_AMP_PolicyD"]
  }
}

roles = {
  "S2_RoleA" = {
    assume_users      = ["S2_UserA"]
    assume_roles      = []
    inline_policies   = {
      "S2_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:RunInstances",
            "s3:ListBucket",
            "ec2:DescribeInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonS3TablesFullAccess"]
  }
}
