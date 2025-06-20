managed_policies = {
  "S17_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iot:DeleteThing","bedrock:DeleteGuardrail"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["bedrock:InvokeAgent","bedrock:UpdateFlow"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyC" = {
    description = "Private-nets ActivateDevice & Auditmanager Update"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["private-networks:ActivateDeviceIdentifier","auditmanager:UpdateAssessment"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyD" = {
    description = "Codecatalyst DeleteConnection & CodeGuru FreeTrialSummary"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["codecatalyst:DeleteConnection","codeguru:GetCodeGuruFreeTrialSummary"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyE" = {
    description = "S3 ListBuckets & EC2 DescribeInstances"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["s3:ListBucket","ec2:DescribeInstances"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyF" = {
    description = "CE CreateAnomalyMonitor"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["ce:CreateAnomalyMonitor"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyG" = {
    description = "iam:GetAccountAuthorizationDetails"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iam:GetAccountAuthorizationDetails"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyU" = {
    description = "IoTAnalytics DescribeChannel & CodeDeploy CreateDeployment"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iotanalytics:DescribeChannel","codedeploy:CreateDeployment"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyY" = {
    description = "RAM GetPermission & SCN CreateDataLakeDataset"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["ram:GetPermission","scn:CreateDataLakeDataset"]
        Resource = "*"
      }]
    }
  }
  "S17_AMP_PolicyZ" = {
    description = "IoTAnalytics DeleteDataset & QApps CreateLibraryItemReview"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iotanalytics:DeleteDataset","qapps:CreateLibraryItemReview"]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S17_UserA" = {
    inline_policies = {
      "S17_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["cloudfront:CreatePublicKey","cloudfront:CopyDistribution"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyA","S17_AMP_PolicyB"]
  }
  "S17_UserB" = {
    inline_policies = {
      "S17_IP_UserB" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["elasticbeanstalk:DeletePlatformVersion","elasticbeanstalk:DescribeEvents"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyD"]
  }
  "S17_UserC" = {
    inline_policies = {
      "S17_IP_UserC" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["sdb:BatchPutAttributes","nimble:CreateStudio"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyF"]
  }
  "S17_UserD" = {
    inline_policies = {
      "S17_IP_UserD" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["codecatalyst:CreateIdentityCenterApplication","codedeploy:UpdateApplication"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyY"]
  }
}

groups = {
  "S17_UserA_GroupA" = {
    users = ["S17_UserA"]
    inline_policies = {
      "S17_IP_UserA_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["s3:CreateBucket","lambda:CreateFunction","ec2:RunInstances"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyC"]
  }
  "S17_UserB_GroupA" = {
    users = ["S17_UserB"]
    inline_policies = {
      "S17_IP_UserB_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["sns:Publish","sns:DeleteTopic"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyU"]
  }
  "S17_UserC_GroupA" = {
    users = ["S17_UserC"]
    inline_policies = {
      "S17_IP_UserC_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["tax:GetExemptions","s3-object-lambda:GetObjectAcl"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyG"]
  }
  "S17_UserD_GroupA" = {
    users = ["S17_UserD"]
    inline_policies = {
      "S17_IP_UserD_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iotanalytics:CreatePipeline","aiops:CreateInvestigationResource"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyU"]
  }
}

roles = {
  "S17_UserA_RoleA" = {
    assume_users    = ["S17_UserA"]
    assume_roles    = []
    inline_policies = {
      "S17_IP_UserA_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ec2:AllocateAddress","controltower:CreateManagedAccount"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S17_AMP_PolicyD"]
  }
  "S17_UserB_RoleA" = {
    assume_users    = ["S17_UserB"]
    assume_roles    = []
    inline_policies = {
      "S17_IP_UserB_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ram:CreatePermission","ec2:BundleInstance"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy","S17_AMP_PolicyE"]
  }
  "S17_UserC_RoleA" = {
    assume_users    = ["S17_UserC"]
    assume_roles    = []
    inline_policies = {
      "S17_IP_UserC_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ram:CreateResourceShare","scn:DescribeInstance"]
          Resource = "*"
        }]
      }
    }
    managed_policies = []
  }
  "S17_UserD_RoleA" = {
    assume_users    = ["S17_UserD"]
    assume_roles    = []
    inline_policies = {
      "S17_IP_UserD_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ram:PromotePermissionCreatedFromPolicy","scn:CreateBillOfMaterialsImportJob"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess","S17_AMP_PolicyZ"]
  }
}
