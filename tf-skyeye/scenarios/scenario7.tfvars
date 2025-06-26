managed_policies = {
  "S7_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "iot:DeleteThing",
          "bedrock:DeleteGuardrail"
        ]
        Resource = "*"
      }]
    }
  }
  "S7_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "bedrock:InvokeAgent",
          "bedrock:UpdateFlow"
        ]
        Resource = "*"
      }]
    }
  }
  "S7_AMP_PolicyC" = {
    description = "S3 ListBucket & EC2 DescribeInstances"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    }
  }
  "S7_AMP_PolicyD" = {
    description = "GetGroupPolicy, ListGroupPolicies, ListPolicyVersions, ListRolePolicies, GetPolicyVersion, ListAttachedRolePolicies"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "iam:GetGroupPolicy",
          "iam:ListGroupPolicies",
          "iam:ListPolicyVersions",
          "iam:ListRolePolicies",
          "iam:GetPolicyVersion",
          "iam:ListAttachedRolePolicies"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S7_UserA" = {
    inline_policies = {
      "S7_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "aiops:CreateInvestigation",
            "iot:CreateThing"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S7_AMP_PolicyA", "S7_AMP_PolicyB"]
    groups            = ["S7_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S7_GroupA" = {
    users = ["S7_UserA"]
    inline_policies = {
      "S7_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListRoles",
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:RunInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "AmazonEKSServicePolicy",
      "S7_AMP_PolicyC"
    ]
  }
}

roles = {
  "S7_RoleA" = {
    assume_users    = ["S7_UserA"]
    assume_roles    = []
    inline_policies = {
      "S7_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListGroupsForUser",
            "iam:ListAttachedUserPolicies",
            "iam:GetUserPolicy",
            "iam:ListUserPolicies",
            "iam:ListAttachedGroupPolicies",
            "iam:GetRolePolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S7_AMP_PolicyD"]
  }
}
