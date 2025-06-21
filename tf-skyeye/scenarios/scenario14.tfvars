managed_policies = {
  "S14_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
    policy = {
      Version   = "2012-10-17"
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
  "S14_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
    policy = {
      Version   = "2012-10-17"
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
  "S14_AMP_PolicyC" = {
    description = "S3 ListBucket & EC2 DescribeInstances"
    policy = {
      Version   = "2012-10-17"
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
  "S14_AMP_PolicyD" = {
    description = "SSM CancelCommand & CodeGuru FreeTrialSummary"
    policy = {
      Version   = "2012-10-17"
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
  "S14_AMP_PolicyE" = {
    description = "EC2 AllocateAddress & BundleInstance"
    policy = {
      Version   = "2012-10-17"
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
  "S14_AMP_PolicyF" = {
    description = "GetGroupPolicy & ListGroupPolicies"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:GetGroupPolicy",
          "iam:ListGroupPolicies"
        ]
        Resource = "*"
      }]
    }
  }
  "S14_AMP_PolicyG" = {
    description = "ListRolePolicies, GetPolicyVersion, ListEntitiesForPolicy, ListPolicies"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:ListRolePolicies",
          "iam:GetPolicyVersion",
          "iam:ListEntitiesForPolicy",
          "iam:ListPolicies"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S14_UserA" = {
    inline_policies = {
      "S14_IP_UserA" = {
        Version   = "2012-10-17"
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
    managed_policies  = ["S14_AMP_PolicyA", "S14_AMP_PolicyB"]
    groups            = ["S14_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S14_GroupA" = {
    users = ["S14_UserA"]
    inline_policies = {
      "S14_IP_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListRoles",
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:RunInstances"   # ← update here
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S14_AMP_PolicyC"]
  }
}

roles = {
  "S14_RoleA" = {
    assume_users    = ["S14_UserA"]
    assume_roles    = []
    inline_policies = {
      "S14_IP_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListGroupsForUser",
            "iam:GetUserPolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "AmazonKinesisFullAccess",
      "S14_AMP_PolicyD"
    ]
  }

  "S14_RoleB" = {
    assume_users    = []
    assume_roles    = ["S14_RoleA"]
    inline_policies = {
      "S14_IP_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListUserPolicies",
            "iam:GetRolePolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "AmazonEKSServicePolicy",
      "S14_AMP_PolicyE"
    ]
  }

  "S14_RoleC" = {
    assume_users    = []
    assume_roles    = ["S14_RoleB"]
    inline_policies = {
      "S14_IP_RoleC" = {
        Version   = "2012-10-17"
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
      "AmazonRoute53ReadOnlyAccess",
      "S14_AMP_PolicyF"
    ]
  }

  "S14_RoleD" = {
    assume_users    = []
    assume_roles    = ["S14_RoleC"]
    inline_policies = {
      "S14_IP_RoleD" = {
        Version   = "2012-10-17"
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
    managed_policies = ["S14_AMP_PolicyG"]
  }
}
