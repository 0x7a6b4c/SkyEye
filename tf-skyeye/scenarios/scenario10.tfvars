managed_policies = {
  "S10_AMP_PolicyA" = {
    description = "AIOps CreateInvestigation & IoT CreateThing"
    policy = {
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
  "S10_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow & ListRoles"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "bedrock:InvokeAgent",
          "bedrock:UpdateFlow",
          "iam:ListRoles"
        ]
        Resource = "*"
      }]
    }
  }
  "S10_AMP_PolicyC" = {
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
}

users = {
  "S10_UserA" = {
    inline_policies = {
      "S10_IP_UserA" = {
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
    managed_policies  = ["S10_AMP_PolicyA"]
    groups            = ["S10_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S10_GroupA" = {
    users = ["S10_UserA"]
    inline_policies = {
      "S10_IP_GroupA" = {
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
      "S10_AMP_PolicyB"
    ]
  }
}

roles = {
  "S10_RoleA" = {
    assume_users    = ["S10_UserA"]
    assume_roles    = []
    inline_policies = {
      "S10_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["iam:GetAccountAuthorizationDetails"]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "AmazonEKSServicePolicy",
      "S10_AMP_PolicyC"
    ]
  }
}
