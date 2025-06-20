managed_policies = {
  "S9_AMP_PolicyA" = {
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
  "S9_AMP_PolicyB" = {
    description = "InvokeAgent & UpdateFlow"
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
}

users = {
  "S9_UserA" = {
    inline_policies = {
      "S9_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:GetAccountAuthorizationDetails"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S9_AMP_PolicyA"]
  }
}

groups = {
  "S9_GroupA" = {
    users           = ["S9_UserA"]
    inline_policies = {
      "S9_IP_GroupA" = {
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
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonKinesisFullAccess",
      "S9_AMP_PolicyB"
    ]
  }
}

roles = {
  "S9_RoleA" = {
    assume_users    = ["S9_UserA"]
    assume_roles    = []
    inline_policies = {
      "S9_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:RunInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy"]
  }
}
