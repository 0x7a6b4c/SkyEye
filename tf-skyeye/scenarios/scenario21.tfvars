managed_policies = {
  "S21_AMP_PolicyA" = {
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
  "S21_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent, UpdateFlow & SimulatePrincipalPolicy"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "bedrock:InvokeAgent",
          "bedrock:UpdateFlow",
          "iam:SimulatePrincipalPolicy"
        ]
        Resource = "*"
      }]
    }
  }
  "S21_AMP_PolicyC" = {
    description = "S3 Create/List & EC2 Describe"
    policy = {
      Version   = "2012-10-17"
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
  "S21_AMP_PolicyD" = {
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
  "S21_AMP_PolicyE" = {
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
}

users = {
  "S21_UserA" = {
    inline_policies = {
      "S21_IP_UserA" = {
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
    managed_policies  = ["S21_AMP_PolicyA", "S21_AMP_PolicyB"]
    groups            = ["S21_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S21_GroupA" = {
    users = ["S21_UserA"]
    inline_policies = {
      "S21_IP_GroupA" = {
        Version   = "2012-10-17"
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
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      "S21_AMP_PolicyC"
    ]
  }
}

roles = {
  "S21_RoleA" = {
    assume_users    = ["S21_UserA"]
    assume_roles    = []
    inline_policies = {
      "S21_IP_RoleA" = {
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
    managed_policies = ["S21_AMP_PolicyD"]
  }
  "S21_RoleB" = {
    assume_users    = []
    assume_roles    = ["S21_RoleA"]
    inline_policies = {
      "S21_IP_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "s3:CreateBucket",
            "lambda:CreateFunction"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
      "S21_AMP_PolicyE"
    ]
  }
}
