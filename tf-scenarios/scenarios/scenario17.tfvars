################################################################################
# 1) Custom Managed Policies
################################################################################
managed_policies = {
  "S17_AMP_PolicyA" = {
    description = "S17: IoT DeleteThing & bedrock DeleteGuardrail"
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

  "S17_AMP_PolicyB" = {
    description = "S17: bedrock InvokeAgent & UpdateFlow"
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

  "S17_AMP_PolicyC" = {
    description = "S17: ActivateDeviceIdentifier & UpdateAssessment"
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

  "S17_AMP_PolicyD" = {
    description = "S17: codecatalyst DeleteConnection & codeguru FreeTrialSummary"
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

  "S17_AMP_PolicyX" = {
    description = "S17: globalaccelerator DeleteAccelerator & codedeploy BatchGetApplications"
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

  "S17_AMP_PolicyE" = {
    description = "S17: S3 ListBuckets & EC2 DescribeInstances"
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

  "S17_AMP_PolicyF" = {
    description = "S17: CE CreateAnomalyMonitor"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["ce:CreateAnomalyMonitor"]
        Resource = "*"
      }]
    })
  }

  "S17_AMP_PolicyG" = {
    description = "S17: GetAccountAuthorizationDetails"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iam:GetAccountAuthorizationDetails"]
        Resource = "*"
      }]
    })
  }

  "S17_AMP_PolicyT" = {
    description = "S17: SSM CancelCommand & GlobalAccelerator CreateAccelerator"
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

  "S17_AMP_PolicyY" = {
    description = "S17: RAM GetPermission & SCN CreateDataLakeDataset"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "ram:GetPermission",
          "scn:CreateDataLakeDataset"
        ]
        Resource = "*"
      }]
    })
  }

  "S17_AMP_PolicyU" = {
    description = "S17: IotAnalytics DescribeChannel & CodeDeploy CreateDeployment"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iotanalytics:DescribeChannel",
          "codedeploy:CreateDeployment"
        ]
        Resource = "*"
      }]
    })
  }

  "S17_AMP_PolicyZ" = {
    description = "S17: IotAnalytics DeleteDataset & QApps CreateLibraryItemReview"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iotanalytics:DeleteDataset",
          "qapps:CreateLibraryItemReview"
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
  "S17_UserA" = {
    inline_policies = {
      "S17_IP_UserA" = jsonencode({
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
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyA"].arn,
      module.iam_policies["S17_AMP_PolicyB"].arn
    ]
  }

  "S17_UserB" = {
    inline_policies = {
      "S17_IP_UserB" = jsonencode({
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
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyD"].arn
    ]
  }

  "S17_UserC" = {
    inline_policies = {
      "S17_IP_UserC" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "sdb:BatchPutAttributes",
            "nimble:CreateStudio"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyF"].arn
    ]
  }

  "S17_UserD" = {
    inline_policies = {
      "S17_IP_UserD" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "codecatalyst:CreateIdentityCenterApplication",
            "codedeploy:UpdateApplication"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyY"].arn
    ]
  }
}

################################################################################
# 3) Groups
################################################################################
groups = {
  "S17_UserA_GroupA" = {
    users           = ["S17_UserA"]
    inline_policies = {
      "S17_IP_UserA_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:CreateInstances"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyC"].arn
    ]
  }

  "S17_UserB_GroupA" = {
    users           = ["S17_UserB"]
    inline_policies = {
      "S17_IP_UserB_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "sns:Publish",
            "sns:DeleteTopic"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyX"].arn
    ]
  }

  "S17_UserC_GroupA" = {
    users           = ["S17_UserC"]
    inline_policies = {
      "S17_IP_UserC_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "tax:GetExemptions",
            "s3-object-lambda:GetObjectAcl"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyG"].arn
    ]
  }

  "S17_UserD_GroupA" = {
    users           = ["S17_UserD"]
    inline_policies = {
      "S17_IP_UserD_GroupA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iotanalytics:CreatePipeline",
            "aiops:CreateInvestigationResource"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyU"].arn
    ]
  }
}

################################################################################
# 4) Roles
################################################################################
roles = {
  "S17_UserA_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S17_UserA" }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S17_IP_UserA_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ec2:AllocateAddress",
            "controltower:CreateManagedAccount"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyT"].arn
    ]
  }

  "S17_UserB_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S17_UserB"
        }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S17_IP_UserB_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ram:CreatePermission",
            "ec2:BundleInstance"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
      module.iam_policies["S17_AMP_PolicyE"].arn
    ]
  }

  "S17_UserC_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S17_UserC"
        }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S17_IP_UserC_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ram:CreateResourceShare",
            "scn:DescribeInstance"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      module.iam_policies["S17_AMP_PolicyF"].arn
    ]
  }

  "S17_UserD_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect    = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/S17_UserD"
        }
        Action    = "sts:AssumeRole"
      }]
    })
    inline_policies = {
      "S17_IP_UserD_RoleA" = jsonencode({
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ram:PromotePermissionCreatedFromPolicy",
            "scn:CreateBillOfMaterialsImportJob"
          ]
          Resource = "*"
        }]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      module.iam_policies["S17_AMP_PolicyZ"].arn
    ]
  }

}
