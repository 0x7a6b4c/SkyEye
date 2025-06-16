################################################################################
# 1) Custom Managed Policies
################################################################################
managed_policies = {
  "S18_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "iot:DeleteThing",
          "bedrock:DeleteGuardrail"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "bedrock:InvokeAgent",
          "bedrock:UpdateFlow"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyC" = {
    description = "ActivateDeviceIdentifier & UpdateAssessment"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "private-networks:ActivateDeviceIdentifier",
          "auditmanager:UpdateAssessment"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyT" = {
    description = "SSM CancelCommand & GlobalAccelerator CreateAccelerator"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "ssm:CancelCommand",
          "globalaccelerator:CreateAccelerator"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyD" = {
    description = "CodeCatalyst DeleteConnection & CodeGuru FreeTrialSummary"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "codecatalyst:DeleteConnection",
          "codeguru:GetCodeGuruFreeTrialSummary"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyX" = {
    description = "GlobalAccelerator DeleteAccelerator & CodeDeploy BatchGetApplications"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "globalaccelerator:DeleteAccelerator",
          "codedeploy:BatchGetApplications"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyE" = {
    description = "S3 ListBuckets & EC2 DescribeInstances"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "s3:ListBuckets",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyF" = {
    description = "LookoutEquipment DeleteModel"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = ["lookoutequipment:DeleteModel"]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyG" = {
    description = "CloudFront public key & distribution copy"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "cloudfront:CreatePublicKey",
          "cloudfront:CopyDistribution"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyO" = {
    description = "RAM CreateResourceShare"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = ["ram:CreateResourceShare"]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyJ" = {
    description = "Tax exemptions & EC2 bundle instance"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "tax:GetExemptions",
          "ec2:BundleInstance"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyY" = {
    description = "SNS platform operations"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "sns:SetTopicAttributes",
          "sns:CreateTopic"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyU" = {
    description = "Elastic Beanstalk RemoveTags & TerminateEnvironment"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "elasticbeanstalk:RemoveTags",
          "elasticbeanstalk:TerminateEnvironment"
        ]
        Resource = "*"
      }]
    })
  }
  "S18_AMP_PolicyZ" = {
    description = "Elastic Beanstalk DeletePlatformVersion & DescribeEvents"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
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
  "S18_UserA" = {
    inline_policies = {
      "S18_IP_UserA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "applicationinsights:CreateApplication",
            "applicationinsights:CreateComponent"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyA"].arn,
      module.iam_policies["S18_AMP_PolicyB"].arn
    ]
  }

  "S18_UserB" = {
    inline_policies = {
      "S18_IP_UserB" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["iam:ListRoles"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyD"].arn
    ]
  }

  "S18_UserC" = {
    inline_policies = {
      "S18_IP_UserC" = jsonencode({
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
      module.iam_policies["S18_AMP_PolicyF"].arn
    ]
  }

  "S18_UserD" = {
    inline_policies = {
      "S18_IP_UserD" = jsonencode({
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
      module.iam_policies["S18_AMP_PolicyY"].arn
    ]
  }
}

################################################################################
# 3) Groups
################################################################################
groups = {
  "S18_UserA_GroupA" = {
    users            = ["S18_UserA"]
    inline_policies  = {
      "S18_IP_UserA_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:CreateInstances"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyC"].arn
    ]
  }

  "S18_UserB_GroupA" = {
    users            = ["S18_UserB"]
    inline_policies  = {
      "S18_IP_UserB_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["applicationinsights:UpdateApplication"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyX"].arn
    ]
  }

  "S18_UserC_GroupA" = {
    users            = ["S18_UserC"]
    inline_policies  = {
      "S18_IP_UserC_GroupA" = jsonencode({
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
      module.iam_policies["S18_AMP_PolicyG"].arn
    ]
  }

  "S18_UserD_GroupA" = {
    users            = ["S18_UserD"]
    inline_policies  = {
      "S18_IP_UserD_GroupA" = jsonencode({
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
      module.iam_policies["S18_AMP_PolicyU"].arn
    ]
  }
}

################################################################################
# 4) Roles
################################################################################
roles = {
  "S18_UserA_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S18_UserA" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserA_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "ec2:AllocateAddress",
            "controltower:CreateManagedAccount"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyT"].arn
    ]
  }

  "S18_UserA_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserA_RoleA"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserA_RoleB" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
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

  "S18_UserB_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S18_UserB" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserB_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "ram:CreatePermission",
            "cloudfront:AssociateAlias"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyE"].arn
    ]
  }

  "S18_UserB_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserB_RoleA"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserB_RoleB" = jsonencode({
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

  "S18_UserB_RoleC" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserB_RoleB"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserB_RoleC" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["elasticloadbalancing:CreateLoadBalancer"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"
    ]
  }

  "S18_UserC_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S18_UserC" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserC_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["lookoutequipment:CreateModel"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyO"].arn
    ]
  }

  "S18_UserC_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserC_RoleA"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserC_RoleB" = jsonencode({
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

  "S18_UserC_RoleC" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserC_RoleB"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserC_RoleC" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["s3-object-lambda:GetObjectAcl"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S18_AMP_PolicyJ"].arn
    ]
  }

  "S18_UserD_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S18_UserD" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserD_RoleA" = jsonencode({
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
      module.iam_policies["S18_AMP_PolicyZ"].arn
    ]
  }

  "S18_UserD_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserD_RoleA"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserD_RoleB" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "lookoutequipment:DescribeDataset",
            "logs:CreateDelivery"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"
    ]
  }

  "S18_UserD_RoleC" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserD_RoleB"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserD_RoleC" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = ["lookoutequipment:ListInferenceEvents"]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
    ]
  }

  "S18_UserD_RoleD" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = module.iam_roles["S18_UserD_RoleC"].arn }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S18_IP_UserD_RoleD" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect = "Allow"
          Action = [
            "drs:CreateSourceNetwork",
            "iam:GetAccountAuthorizationDetails"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"
    ]
  }
}
