managed_policies = {
  "S11_AMP_PolicyA" = {
    description = "AIOps CreateInvestigation, IoT CreateThing, ListRoles"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "aiops:CreateInvestigation",
          "iot:CreateThing",
          "iam:ListRoles"
        ]
        Resource = "*"
      }]
    }
  }
  "S11_AMP_PolicyB" = {
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
  "S11_AMP_PolicyC" = {
    description = "S3 CreateBucket, Lambda CreateFunction, EC2 RunInstances"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "s3:CreateBucket",
          "lambda:CreateFunction",
          "ec2:RunInstances"
        ]
        Resource = "*"
      }]
    }
  }
  "S11_AMP_PolicyE" = {
    description = "EC2 AllocateAddress & BundleInstance"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "ec2:AllocateAddress",
          "ec2:BundleInstance"
        ]
        Resource = "*"
      }]
    }
  }
  "S11_AMP_PolicyF" = {
    description = "Cloud9 CreateEnvMembership & CreateEnvSSH"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "cloud9:CreateEnvironmentMembership",
          "cloud9:CreateEnvironmentSSH"
        ]
        Resource = "*"
      }]
    }
  }
  "S11_AMP_PolicyG" = {
    description = "GetAccountAuthorizationDetails"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = ["iam:GetAccountAuthorizationDetails"]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S11_UserA" = {
    inline_policies = {
      "S11_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "tax:GetExemptions",
            "s3-object-lambda:GetObjectAcl"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S11_AMP_PolicyA"]
    groups            = ["S11_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S11_GroupA" = {
    users = ["S11_UserA"]
    inline_policies = {
      "S11_IP_GroupA" = {
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
    managed_policies = [
      "AmazonKinesisFullAccess",
      "S11_AMP_PolicyB"
    ]
  }
}

roles = {
  "S11_RoleA" = {
    assume_users    = ["S11_UserA"]
    assume_roles    = []
    inline_policies = {
      "S11_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "ssm:CancelCommand",
            "codeguru:GetCodeGuruFreeTrialSummary"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "AmazonEKSServicePolicy",
      "S11_AMP_PolicyC"
    ]
  }

  "S11_RoleB" = {
    assume_users    = []
    assume_roles    = ["S11_RoleA"]
    inline_policies = {
      "S11_IP_RoleB" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "detective:AcceptInvitation",
            "transfer:CreateAccess"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "AmazonEKSServicePolicy",
      "S11_AMP_PolicyE"
    ]
  }

  "S11_RoleC" = {
    assume_users    = []
    assume_roles    = ["S11_RoleB"]
    inline_policies = {
      "S11_IP_RoleC" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "controltower:CreateManagedAccount",
            "nimble:CreateStudio"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S11_AMP_PolicyF"]
  }

  "S11_RoleD" = {
    assume_users    = []
    assume_roles    = ["S11_RoleC"]
    inline_policies = {
      "S11_IP_RoleD" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "tax:GetExemptions",
            "s3-object-lambda:GetObjectAcl"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S11_AMP_PolicyG"]
  }
}
