managed_policies = {
  "S3_AMP_PolicyA" = {
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
  "S3_AMP_PolicyB" = {
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
  "S3_AMP_PolicyD" = {
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
  "S3_AMP_PolicyC" = {
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
  "S3_UserA" = {
    inline_policies = {
      "S3_IP_UserA" = {
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
    managed_policies  = ["S3_AMP_PolicyA", "S3_AMP_PolicyB", "S3_AMP_PolicyD"]
    groups            = ["S3_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S3_GroupA" = {
    users = ["S3_UserA"]
    inline_policies = {
      "S3_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListRolePolicies",
            "iam:GetPolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S3_AMP_PolicyC"]
  }
}

roles = {
  "S3_RoleA" = {
    assume_users    = ["S3_UserA"]
    assume_roles    = []
    inline_policies = {
      "S3_IP_RoleA" = {
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
