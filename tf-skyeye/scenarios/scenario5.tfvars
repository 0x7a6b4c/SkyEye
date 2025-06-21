managed_policies = {
  "S5_AMP_PolicyA" = {
    description = "UpdateInvestigation & AttachThingPrincipal"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "aiops:UpdateInvestigation",
          "iot:AttachThingPrincipal"
        ]
        Resource = "*"
      }]
    }
  }
  "S5_AMP_PolicyB" = {
    description = "DeleteThing & DeleteGuardrail"
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
  "S5_AMP_PolicyC" = {
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
  "S5_AMP_PolicyD" = {
    description = "ActivateDeviceIdentifier & UpdateAssessment"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "private-networks:ActivateDeviceIdentifier",
          "auditmanager:UpdateAssessment"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S5_UserA" = {
    inline_policies = {
      "S5_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListGroupsForUser",
            "iam:ListAttachedUserPolicies",
            "iam:GetUserPolicy",
            "iam:ListUserPolicies",
            "iam:GetRolePolicy",
            "iam:GetGroupPolicy",
            "iam:ListGroupPolicies",
            "iam:ListEntitiesForPolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S5_AMP_PolicyA", "S5_AMP_PolicyB"]
    groups            = ["S5_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S5_GroupA" = {
    users = ["S5_UserA"]
    inline_policies = {
      "S5_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListRolePolicies",
            "iam:ListPolicyVersions",
            "iam:GetPolicyVersion",
            "iam:ListRoles"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "S5_AMP_PolicyC",
      "S5_AMP_PolicyA",
      "AmazonMQFullAccess"
    ]
  }
}

roles = {
  "S5_RoleA" = {
    assume_users    = ["S5_UserA"]
    assume_roles    = []
    inline_policies = {
      "S5_IP_RoleA" = {
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
    managed_policies = [
      "AmazonRoute53ReadOnlyAccess",
      "AmazonKinesisFullAccess",
      "S5_AMP_PolicyD",
      "S5_AMP_PolicyB"
    ]
  }
}
