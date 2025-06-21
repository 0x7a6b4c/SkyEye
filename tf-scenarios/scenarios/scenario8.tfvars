managed_policies = {
  "S8_AMP_PolicyA" = {
    description = "IoT DeleteThing & bedrock DeleteGuardrail"
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
  "S8_AMP_PolicyB" = {
    description = "bedrock InvokeAgent & UpdateFlow"
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
  "S8_AMP_PolicyC" = {
    description = "S3 ListBuckets & EC2 DescribeInstances"
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
  "S8_AMP_PolicyD" = {
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
  "S8_AMP_PolicyE" = {
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
  "S8_AMP_PolicyF" = {
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
  "S8_AMP_PolicyG" = {
    description = "ListPolicyVersions, ListRolePolicies, GetPolicyVersions"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:ListPolicyVersions",
          "iam:ListRolePolicies",
          "iam:GetPolicyVersions"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S8_UserA" = {
    inline_policies = {
      "S8_IP_UserA" = {
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
    managed_policies = [
      "S8_AMP_PolicyA",
      "S8_AMP_PolicyB"
    ]
  }
}

groups = {
  "S8_GroupA" = {
    users = ["S8_UserA"]
    inline_policies = {
      "S8_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
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
      "S8_AMP_PolicyC"
    ]
  }
}

roles = {
  "S8_RoleA" = {
    assume_users    = ["S8_UserA"]
    assume_roles    = []
    inline_policies = {
      "S8_IP_RoleA" = {
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
    managed_policies = [
      "S8_AMP_PolicyD"
    ]
  }
  "S8_RoleB" = {
    assume_users    = []
    assume_roles    = ["S8_RoleA"]
    inline_policies = {
      "S8_IP_RoleB" = {
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
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
      "S8_AMP_PolicyE"
    ]
  }
  "S8_RoleC" = {
    assume_users    = []
    assume_roles    = ["S8_RoleB"]
    inline_policies = {
      "S8_IP_RoleC" = {
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
    managed_policies = [
      "S8_AMP_PolicyF"
    ]
  }
  "S8_RoleD" = {
    assume_users    = []
    assume_roles    = ["S8_RoleC"]
    inline_policies = {
      "S8_IP_RoleD" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "tax:GetExemptions",
            "s3-object-lambda:GetObjectAcl",
            "qapps:CreateLibraryItemReview"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "S8_AMP_PolicyG"
    ]
  }
}
