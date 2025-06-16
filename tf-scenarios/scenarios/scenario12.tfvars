managed_policies = {
  "S12_AMP_PolicyA" = {
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
  "S12_AMP_PolicyB" = {
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
  "S12_AMP_PolicyC" = {
    description = "S3 ListBuckets & EC2 DescribeInstances"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "s3:ListBuckets",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    }
  }
  "S12_AMP_PolicyD" = {
    description = "GetGroupPolicy, ListGroupPolicies, ListRolePolicies, GetPolicyVersions"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "iam:GetGroupPolicy",
          "iam:ListGroupPolicies",
          "iam:ListRolePolicies",
          "iam:GetPolicyVersions"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S12_UserA" = {
    inline_policies = {
      "S12_IP_UserA" = {
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
    managed_policies = [
      "S12_AMP_PolicyA",
      "S12_AMP_PolicyB"
    ]
  }
}

groups = {
  "S12_GroupA" = {
    users           = ["S12_UserA"]
    inline_policies = {
      "S12_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListRoles",
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:CreateInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
      "S12_AMP_PolicyC"
    ]
  }
}

roles = {
  "S12_RoleA" = {
    assume_users    = ["S12_UserA"]
    assume_roles    = []
    inline_policies = {
      "S12_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListGroupsForUser",
            "iam:GetUserPolicy",
            "iam:ListUserPolicies",
            "iam:GetRolePolicy",
            "iam:ListEntitiesForPolicy",
            "iam:ListPolicies"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      "S12_AMP_PolicyD"
    ]
  }
}
