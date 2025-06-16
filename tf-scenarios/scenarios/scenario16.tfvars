# scenarios/scenario16.tfvars

################################################################################
# 1) Custom Managed Policies
################################################################################
managed_policies = {
  "S16_AMP_PolicyA" = {
    description = "S16: IoT DeleteThing & bedrock DeleteGuardrail"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iot:DeleteThing",
          "bedrock:DeleteGuardrail"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyB" = {
    description = "S16: bedrock InvokeAgent & UpdateFlow"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "bedrock:InvokeAgent",
          "bedrock:UpdateFlow"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyC" = {
    description = "S16: ActivateDeviceIdentifier & UpdateAssessment"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "private-networks:ActivateDeviceIdentifier",
          "auditmanager:UpdateAssessment"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyT" = {
    description = "S16: ssm CancelCommand & globalaccelerator CreateAccelerator"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "ssm:CancelCommand",
          "globalaccelerator:CreateAccelerator"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyD" = {
    description = "S16: codecatalyst DeleteConnection & codeguru FreeTrialSummary"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "codecatalyst:DeleteConnection",
          "codeguru:GetCodeGuruFreeTrialSummary"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyX" = {
    description = "S16: globalaccelerator DeleteAccelerator & codedeploy BatchGetApplications"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "globalaccelerator:DeleteAccelerator",
          "codedeploy:BatchGetApplications"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyE" = {
    description = "S16: s3 ListBuckets & ec2 DescribeInstances"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "s3:ListBuckets",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyF" = {
    description = "S16: ListAttachedRolePolicies, GetGroupPolicy, ListGroupPolicies"
    policy = jsonencode({
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
    })
  }
  "S16_AMP_PolicyG" = {
    description = "S16: CloudFront key operations"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "cloudfront:CreatePublicKey",
          "cloudfront:CopyDistribution"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyO" = {
    description = "S16: ram CreateResourceShare"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["ram:CreateResourceShare"]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyJ" = {
    description = "S16: tax GetExemptions & ec2 BundleInstance"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "tax:GetExemptions",
          "ec2:BundleInstance"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyY" = {
    description = "S16: sns platform operations"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "sns:SetTopicAttributes",
          "sns:CreateTopic"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyU" = {
    description = "S16: EB RemoveTags & TerminateEnvironment"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "elasticbeanstalk:RemoveTags",
          "elasticbeanstalk:TerminateEnvironment"
        ]
        Resource = "*"
      }]
    })
  }
  "S16_AMP_PolicyZ" = {
    description = "S16: EB DeletePlatformVersion & DescribeEvents"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "elasticbeanstalk:DeletePlatformVersion",
          "elasticbeanstalk:DescribeEvents"
        ]
        Resource = "*"
      }]
    })
  }
}

################################################################################
# 2) Users
################################################################################
users = {
  "S16_UserA" = {
    inline_policies = {
      "S16_IP_UserA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["iam:ListGroupsForUser"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyA"].arn,
      module.iam_policies["S16_AMP_PolicyB"].arn
    ]
  }

  "S16_UserB" = {
    inline_policies = {
      "S16_IP_UserB" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["iam:ListUserPolicies"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyD"].arn
    ]
  }

  "S16_UserC" = {
    inline_policies = {
      "S16_IP_UserC" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "sdb:BatchPutAttributes",
            "nimble:CreateStudio"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyF"].arn
    ]
  }

  "S16_UserD" = {
    inline_policies = {
      "S16_IP_UserD" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "sns:CreatePlatformEndpoint",
            "sns:CreatePlatformApplication"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyY"].arn
    ]
  }
}

################################################################################
# 3) Groups
################################################################################
groups = {
  "S16_UserA_GroupA" = {
    users            = ["S16_UserA"]
    inline_policies  = {
      "S16_IP_UserA_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListRoles",
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:CreateInstances"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyC"].arn
    ]
  }

  "S16_UserB_GroupA" = {
    users           = ["S16_UserB"]
    inline_policies = {
      "S16_IP_UserB_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["iam:ListPolicyVersions"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyX"].arn
    ]
  }

  "S16_UserC_GroupA" = {
    users           = ["S16_UserC"]
    inline_policies = {
      "S16_IP_UserC_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "cloudfront:CreateKeyGroup",
            "cloudfront:CreateKeyValueStore"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyG"].arn
    ]
  }

  "S16_UserD_GroupA" = {
    users = ["S16_UserD"]
    inline_policies = {
      "S16_IP_UserD_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "elasticbeanstalk:AssociateEnvironmentOperationsRole",
            "elasticbeanstalk:DescribeApplications"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyU"].arn
    ]
  }
}

################################################################################
# 4) Roles
################################################################################
roles = {
  "S16_UserA_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S16_UserA" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserA_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:ListAttachedUserPolicies",
            "ec2:AllocateAddress",
            "controltower:CreateManagedAccount"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyT"].arn
    ]
  }

  "S16_UserA_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S16_UserA_RoleA"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserA_RoleB" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "iam:GetUserPolicy",
            "iotanalytics:UpdateDatastore",
            "iotanalytics:UpdatePipeline"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
    ]
  }

  "S16_UserB_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S16_UserB" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserB_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "ram:CreatePermission",
            "cloudfront:AssociateAlias",
            "iam:ListAttachedGroupPolicies"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyE"].arn
    ]
  }

  "S16_UserB_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S16_UserB_RoleA"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserB_RoleB" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "connect:ActivateEvaluationForm",
            "connect:AssociateBot"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
    ]
  }

  "S16_UserB_RoleC" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S16_UserB_RoleB"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserB_RoleC" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["iam:GetRolePolicy"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"
    ]
  }

  "S16_UserC_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S16_UserC" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserC_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["iam:ListRolePolicies"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyO"].arn
    ]
  }

  "S16_UserC_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S16_UserC_RoleA"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserC_RoleB" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["cloudfront:DisassociateDistributionWebACL"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"
    ]
  }

  "S16_UserC_RoleC" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S16_UserC_RoleB"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserC_RoleC" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "s3-object.lambda:GetObjectAcl",
            "iam:GetPolicyVersions"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S16_AMP_PolicyJ"].arn
    ]
  }

  "S16_UserD_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S16_UserD" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S16_IP_UserD_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "sns:Publish",
            "sns:DeleteTopic"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      module.iam_policies["S16_AMP_PolicyZ"].arn
    ]
  }
}
