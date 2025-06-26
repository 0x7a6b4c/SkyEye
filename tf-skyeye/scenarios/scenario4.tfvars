managed_policies = {
  "S4_AMP_PolicyA" = {
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
  "S4_AMP_PolicyB" = {
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
  "S4_AMP_PolicyC" = {
    description = "AIOps CreateInvestigation & IoT CreateThing"
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
  "S4_AMP_PolicyD" = {
    description = "GetPolicyVersion, ListAttachedRolePolicies, ListRoles"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:GetPolicyVersion",
          "iam:ListAttachedRolePolicies",
          "iam:ListRoles"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S4_UserA" = {
    inline_policies = {
      "S4_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListGroups",
            "iam:ListAttachedUserPolicies",
            "iam:GetUserPolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S4_AMP_PolicyA", "S4_AMP_PolicyB", "S4_AMP_PolicyC"]
    groups            = ["S4_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S4_GroupA" = {
    users = ["S4_UserA"]
    inline_policies = {
      "S4_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListRolePolicies"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S4_AMP_PolicyD"]
  }
}

roles = {
  "S4_RoleA" = {
    assume_users    = ["S4_UserA"]
    assume_roles    = []
    inline_policies = {
      "S4_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
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
    managed_policies = ["AmazonRoute53ReadOnlyAccess"]
  }
}
