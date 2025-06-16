managed_policies = {
  "S15_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iot:DeleteThing","bedrock:DeleteGuardrail"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["bedrock:InvokeAgent","bedrock:UpdateFlow"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyC" = {
    description = "ActivateDeviceIdentifier & UpdateAssessment"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["private-networks:ActivateDeviceIdentifier","auditmanager:UpdateAssessment"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyT" = {
    description = "SSM CancelCommand & GlobalAccelerator CreateAccelerator"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["ssm:CancelCommand","globalaccelerator:CreateAccelerator"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyD" = {
    description = "CodeCatalyst DeleteConnection & CodeGuru FreeTrialSummary"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["codecatalyst:DeleteConnection","codeguru:GetCodeGuruFreeTrialSummary"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyX" = {
    description = "GlobalAccelerator DeleteAccelerator & CodeDeploy BatchGetApplications"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["globalaccelerator:DeleteAccelerator","codedeploy:BatchGetApplications"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyE" = {
    description = "S3 ListBuckets & EC2 DescribeInstances"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["s3:ListBuckets","ec2:DescribeInstances"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyF" = {
    description = "ListAttachedRolePolicies, GetGroupPolicy, ListGroupPolicies"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iam:ListAttachedRolePolicies","iam:GetGroupPolicy","iam:ListGroupPolicies"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyG" = {
    description = "ListRolePolicies & GetPolicyVersions"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iam:ListRolePolicies","iam:GetPolicyVersions"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyY" = {
    description = "RAM GetPermission & SCN CreateDataLakeDataset"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["ram:GetPermission","scn:CreateDataLakeDataset"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyU" = {
    description = "IoTAnalytics DescribeChannel & CodeDeploy CreateDeployment"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iotanalytics:DescribeChannel","codedeploy:CreateDeployment"]
        Resource = "*"
      }]
    }
  }
  "S15_AMP_PolicyZ" = {
    description = "IoTAnalytics DeleteDataset & QApps CreateLibraryItemReview"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["iotanalytics:DeleteDataset","qapps:CreateLibraryItemReview"]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S15_UserA" = {
    inline_policies = {
      "S15_IP_UserA" = {
        Version   = "2012-10-17"
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
    managed_policies = ["S15_AMP_PolicyA","S15_AMP_PolicyB"]
  }

  "S15_UserB" = {
    inline_policies = {
      "S15_IP_UserB" = {
        Version   = "2012-10-17"
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
    managed_policies = ["S15_AMP_PolicyD"]
  }

  "S15_UserC" = {
    inline_policies = {
      "S15_IP_UserC" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["sdb:BatchPutAttributes","nimble:CreateStudio"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S15_AMP_PolicyF"]
  }

  "S15_UserD" = {
    inline_policies = {
      "S15_IP_UserD" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["codecatalyst:CreateIdentityCenterApplication","codedeploy:UpdateApplication"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S15_AMP_PolicyY"]
  }
}

groups = {
  "S15_UserA_GroupA" = {
    users           = ["S15_UserA"]
    inline_policies = {
      "S15_IP_UserA_GroupA" = {
        Version   = "2012-10-17"
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
    managed_policies = ["S15_AMP_PolicyC"]
  }
  "S15_UserB_GroupA" = {
    users           = ["S15_UserB"]
    inline_policies = {
      "S15_IP_UserB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListPolicyVersions"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S15_AMP_PolicyX"]
  }
  "S15_UserC_GroupA" = {
    users           = ["S15_UserC"]
    inline_policies = {
      "S15_IP_UserC_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["tax:GetExemptions","s3-object-lambda:GetObjectAcl"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S15_AMP_PolicyG"]
  }
  "S15_UserD_GroupA" = {
    users           = ["S15_UserD"]
    inline_policies = {
      "S15_IP_UserD_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iotanalytics:CreatePipeline","aiops:CreateInvestigationResource"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S15_AMP_PolicyU"]
  }
}

roles = {
  "S15_UserA_RoleA" = {
    assume_users    = ["S15_UserA"]
    assume_roles    = []
    inline_policies = {
      "S15_IP_UserA_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ec2:AllocateAddress","controltower:CreateManagedAccount"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S15_AMP_PolicyT"]
  }

  "S15_UserB_RoleA" = {
    assume_users    = ["S15_UserB"]
    assume_roles    = []
    inline_policies = {
      "S15_IP_UserB_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ram:CreatePermission","ec2:BundleInstance"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy","S15_AMP_PolicyE"]
  }

  "S15_UserC_RoleA" = {
    assume_users    = ["S15_UserC"]
    assume_roles    = []
    inline_policies = {
      "S15_IP_UserC_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ram:CreateResourceShare","scn:DescribeInstance"]
          Resource = "*"
        }]
      }
    }
    managed_policies = []
  }

  "S15_UserD_RoleA" = {
    assume_users    = ["S15_UserD"]
    assume_roles    = []
    inline_policies = {
      "S15_IP_UserD_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ram:PromotePermissionCreatedFromPolicy","scn:CreateBillOfMaterialsImportJob"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess","S15_AMP_PolicyZ"]
  }
}
