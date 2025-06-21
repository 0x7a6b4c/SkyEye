managed_policies = {
  "S13_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iot:DeleteThing",
          "bedrock:DeleteGuardrail"
        ]
        Resource = "*"
      }]
    }
  }
  "S13_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "bedrock:InvokeAgent",
          "bedrock:UpdateFlow"
        ]
        Resource = "*"
      }]
    }
  }
  "S13_AMP_PolicyC" = {
    description = "S3 ListBucket & EC2 DescribeInstances"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "s3:ListBucket",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    }
  }
  "S13_AMP_PolicyD" = {
    description = "SSM CancelCommand & CodeGuru FreeTrialSummary"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "ssm:CancelCommand",
          "codeguru:GetCodeGuruFreeTrialSummary"
        ]
        Resource = "*"
      }]
    }
  }
  "S13_AMP_PolicyE" = {
    description = "EC2 AllocateAddress & BundleInstance"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "ec2:AllocateAddress",
          "ec2:BundleInstance"
        ]
        Resource = "*"
      }]
    }
  }
  "S13_AMP_PolicyF" = {
    description = "ListAttachedRolePolicies, GetGroupPolicy, ListGroupPolicies"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:ListAttachedRolePolicies",
          "iam:GetGroupPolicy",
          "iam:ListGroupPolicies"
        ]
        Resource = "*"
      }]
    }
  }
  "S13_AMP_PolicyG" = {
    description = "ListRolePolicies & GetPolicyVersion"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:ListRolePolicies",
          "iam:GetPolicyVersion"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S13_UserA" = {
    inline_policies = {
      "S13_IP_UserA" = {
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
    managed_policies  = ["S13_AMP_PolicyA", "S13_AMP_PolicyB"]
    groups            = ["S13_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S13_GroupA" = {
    users = ["S13_UserA"]
    inline_policies = {
      "S13_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListRoles",
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:RunInstances"   # ← updated here
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S13_AMP_PolicyC"]
  }
}

roles = {
  "S13_RoleA" = {
    assume_users    = ["S13_UserA"]
    assume_roles    = []
    inline_policies = {
      "S13_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListGroupsForUser",
            "iam:ListAttachedUserPolicies",
            "iam:GetUserPolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S13_AMP_PolicyD"]
  }

  "S13_RoleB" = {
    assume_users    = []
    assume_roles    = ["S13_RoleA"]
    inline_policies = {
      "S13_IP_RoleB" = {
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
    managed_policies = [
      "AmazonEKSServicePolicy",
      "S13_AMP_PolicyE"
    ]
  }

  "S13_RoleC" = {
    assume_users    = []
    assume_roles    = ["S13_RoleB"]
    inline_policies = {
      "S13_IP_RoleC" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "controltower:CreateManagedAccount",
            "nimble:CreateStudio"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S13_AMP_PolicyF"]
  }

  "S13_RoleD" = {
    assume_users    = []
    assume_roles    = ["S13_RoleC"]
    inline_policies = {
      "S13_IP_RoleD" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "tax:GetExemptions",
            "s3-object-lambda:GetObjectAcl"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S13_AMP_PolicyG"]
  }
}
