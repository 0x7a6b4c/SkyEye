managed_policies = {
  "S6_AMP_PolicyA" = {
    description = "UpdateInvestigation & AttachThingPrincipal"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "aiops:UpdateInvestigation",
          "iot:AttachThingPrincipal"
        ]
        Resource = "*"
      }]
    }
  }
  "S6_AMP_PolicyB" = {
    description = "DeleteThing & DeleteGuardrail"
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
  "S6_AMP_PolicyC" = {
    description = "CreateInvestigation & CreateThing"
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
  "S6_AMP_PolicyD" = {
    description = "CreateInvestigationResource & CreateLibraryItemReview"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "aiops:CreateInvestigationResource",
          "qapps:CreateLibraryItemReview"
        ]
        Resource = "*"
      }]
    }
  }
  "S6_AMP_PolicyE" = {
    description = "ActivateDeviceIdentifier & UpdateAssessment"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "private-networks:ActivateDeviceIdentifier",
          "auditmanager:UpdateAssessment"
        ]
        Resource = "*"
      }]
    }
  }
  "S6_AMP_PolicyF" = {
    description = "CancelJob & CreateExperimentTemplate"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "iot:CancelJob",
          "fis:CreateExperimentTemplate"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S6_UserA" = {
    inline_policies = {
      "S6_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListGroupsForUser",
            "iam:GetUserPolicy",
            "iam:ListUserPolicies",
            "iam:GetRolePolicy",
            "iam:GetGroupPolicy",
            "iam:ListGroupPolicies",
            "iam:ListPolicies"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "S6_AMP_PolicyA",
      "S6_AMP_PolicyB"
    ]
  }
}

groups = {
  "S6_GroupA" = {
    users           = ["S6_UserA"]
    inline_policies = {
      "S6_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListRolePolicies",
            "iam:ListPolicyVersions",
            "iam:GetPolicyVersions",
            "iam:ListRoles"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "S6_AMP_PolicyC",
      "S6_AMP_PolicyD",
      "arn:aws:iam::aws:policy/AmazonMQFullAccess"
    ]
  }
}

roles = {
  "S6_RoleA" = {
    assume_users    = ["S6_UserA"]
    assume_roles    = []
    inline_policies = {
      "S6_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:CreateInstances",
            "s3:ListBuckets",
            "ec2:DescribeInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      "arn:aws:iam::aws:policy/AmazonKinesisFullAccess",
      "S6_AMP_PolicyE",
      "S6_AMP_PolicyF"
    ]
  }
}
