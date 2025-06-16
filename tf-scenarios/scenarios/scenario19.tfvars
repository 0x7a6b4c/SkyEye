managed_policies = {
  "S19_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
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
  "S19_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
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
  "S19_AMP_PolicyC" = {
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
  "S19_AMP_PolicyT" = {
    description = "SSM CancelCommand & GlobalAccelerator CreateAccelerator"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "ssm:CancelCommand",
          "globalaccelerator:CreateAccelerator"
        ]
        Resource = "*"
      }]
    }
  }
  "S19_AMP_PolicyD" = {
    description = "CodeCatalyst DeleteConnection & CodeGuru FreeTrialSummary"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "codecatalyst:DeleteConnection",
          "codeguru:GetCodeGuruFreeTrialSummary"
        ]
        Resource = "*"
      }]
    }
  }
  "S19_AMP_PolicyX" = {
    description = "GlobalAccelerator DeleteAccelerator & CodeDeploy BatchGetApplications"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "globalaccelerator:DeleteAccelerator",
          "codedeploy:BatchGetApplications"
        ]
        Resource = "*"
      }]
    }
  }
  "S19_AMP_PolicyE" = {
    description = "S3 ListBuckets & EC2 DescribeInstances"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "s3:ListBuckets",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    }
  }
  "S19_AMP_PolicyF" = {
    description = "ListAttachedRolePolicies, GetGroupPolicy, ListGroupPolicies"
    policy = {
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
    }
  }
  "S19_AMP_PolicyG" = {
    description = "ListRolePolicies & GetPolicyVersions"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:ListRolePolicies",
          "iam:GetPolicyVersions"
        ]
        Resource = "*"
      }]
    }
  }
  "S19_AMP_PolicyY" = {
    description = "RAM GetPermission & SCN CreateDataLakeDataset"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "ram:GetPermission",
          "scn:CreateDataLakeDataset"
        ]
        Resource = "*"
      }]
    }
  }
  "S19_AMP_PolicyU" = {
    description = "IoTAnalytics DescribeChannel & CodeDeploy CreateDeployment"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iotanalytics:DescribeChannel",
          "codedeploy:CreateDeployment"
        ]
        Resource = "*"
      }]
    }
  }
  "S19_AMP_PolicyZ" = {
    description = "IoTAnalytics DeleteDataset & QApps CreateLibraryItemReview"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iotanalytics:DeleteDataset",
          "qapps:CreateLibraryItemReview"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S19_UserA" = {
    inline_policies = {
      "S19_IP_UserA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListGroupsForUser",
            "iam:ListAttachedUserPolicies",
            "iam:GetUserPolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "S19_AMP_PolicyA",
      "S19_AMP_PolicyB"
    ]
  }
  "S19_UserB" = {
    inline_policies = {
      "S19_IP_UserB" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListUserPolicies",
            "iam:ListAttachedGroupPolicies",
            "iam:GetRolePolicy"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyD"]
  }
  "S19_UserC" = {
    inline_policies = {
      "S19_IP_UserC" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "sdb:BatchPutAttributes",
            "nimble:CreateStudio"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyF"]
  }
  "S19_UserD" = {
    inline_policies = {
      "S19_IP_UserD" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "codecatalyst:CreateIdentityCenterApplication",
            "codedeploy:UpdateApplication"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyY"]
  }
}

groups = {
  "S19_UserA_GroupA" = {
    users           = ["S19_UserA"]
    inline_policies = {
      "S19_IP_UserA_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListRoles",
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:CreateInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyC"]
  }
  "S19_UserB_GroupA" = {
    users           = ["S19_UserB"]
    inline_policies = {
      "S19_IP_UserB_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["drs:CreateConvertedSnapshotForDrs"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyX"]
  }
  "S19_UserC_GroupA" = {
    users           = ["S19_UserC"]
    inline_policies = {
      "S19_IP_UserC_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "tax:GetExemptions",
            "s3-object-lambda:GetObjectAcl"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyG"]
  }
  "S19_UserD_GroupA" = {
    users           = ["S19_UserD"]
    inline_policies = {
      "S19_IP_UserD_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iotanalytics:CreatePipeline",
            "aiops:CreateInvestigationResource"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyU"]
  }
}

roles = {
  "S19_UserA_RoleA" = {
    assume_users    = ["S19_UserA"]
    assume_roles    = []
    inline_policies = {
      "S19_IP_UserA_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ec2:AllocateAddress",
            "controltower:CreateManagedAccount"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S19_AMP_PolicyT"]
  }
  "S19_UserB_RoleA" = {
    assume_users    = ["S19_UserB"]
    assume_roles    = []
    inline_policies = {
      "S19_IP_UserB_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ram:CreatePermission",
            "ec2:BundleInstance"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
      "S19_AMP_PolicyE"
    ]
  }
  "S19_UserC_RoleA" = {
    assume_users    = ["S19_UserC"]
    assume_roles    = []
    inline_policies = {
      "S19_IP_UserC_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ram:CreateResourceShare",
            "scn:DescribeInstance"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = []
  }
  "S19_UserD_RoleA" = {
    assume_users    = ["S19_UserD"]
    assume_roles    = []
    inline_policies = {
      "S19_IP_UserD_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ram:PromotePermissionCreatedFromPolicy",
            "scn:CreateBillOfMaterialsImportJob"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      "S19_AMP_PolicyZ"
    ]
  }
}
