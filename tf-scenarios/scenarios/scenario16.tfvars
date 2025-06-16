managed_policies = {
  "S16_AMP_PolicyA" = {
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
  "S16_AMP_PolicyB" = {
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
  "S16_AMP_PolicyC" = {
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
  "S16_AMP_PolicyT" = {
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
  "S16_AMP_PolicyD" = {
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
  "S16_AMP_PolicyX" = {
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
  "S16_AMP_PolicyE" = {
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
  "S16_AMP_PolicyF" = {
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
  "S16_AMP_PolicyG" = {
    description = "CloudFront CreatePublicKey & CopyDistribution"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["cloudfront:CreatePublicKey","cloudfront:CopyDistribution"]
        Resource = "*"
      }]
    }
  }
  "S16_AMP_PolicyO" = {
    description = "RAM CreateResourceShare"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["ram:CreateResourceShare"]
        Resource = "*"
      }]
    }
  }
  "S16_AMP_PolicyJ" = {
    description = "Tax GetExemptions & EC2 BundleInstance"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["tax:GetExemptions","ec2:BundleInstance"]
        Resource = "*"
      }]
    }
  }
  "S16_AMP_PolicyY" = {
    description = "SNS SetTopicAttributes & CreateTopic"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["sns:SetTopicAttributes","sns:CreateTopic"]
        Resource = "*"
      }]
    }
  }
  "S16_AMP_PolicyU" = {
    description = "EB RemoveTags & TerminateEnvironment"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["elasticbeanstalk:RemoveTags","elasticbeanstalk:TerminateEnvironment"]
        Resource = "*"
      }]
    }
  }
  "S16_AMP_PolicyZ" = {
    description = "EB DeletePlatformVersion & DescribeEvents"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["elasticbeanstalk:DeletePlatformVersion","elasticbeanstalk:DescribeEvents"]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S16_UserA" = {
    inline_policies = {
      "S16_IP_UserA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListGroupsForUser"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyA","S16_AMP_PolicyB"]
  }

  "S16_UserB" = {
    inline_policies = {
      "S16_IP_UserB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListUserPolicies"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyD"]
  }

  "S16_UserC" = {
    inline_policies = {
      "S16_IP_UserC" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["sdb:BatchPutAttributes","nimble:CreateStudio"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyF"]
  }

  "S16_UserD" = {
    inline_policies = {
      "S16_IP_UserD" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["sns:CreatePlatformEndpoint","sns:CreatePlatformApplication"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyY"]
  }
}

groups = {
  "S16_UserA_GroupA" = {
    users           = ["S16_UserA"]
    inline_policies = {
      "S16_IP_UserA_GroupA" = {
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
    managed_policies = ["S16_AMP_PolicyC"]
  }
  "S16_UserB_GroupA" = {
    users           = ["S16_UserB"]
    inline_policies = {
      "S16_IP_UserB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListPolicyVersions"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyX"]
  }
  "S16_UserC_GroupA" = {
    users           = ["S16_UserC"]
    inline_policies = {
      "S16_IP_UserC_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["cloudfront:CreateKeyGroup","cloudfront:CreateKeyValueStore"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyG"]
  }
  "S16_UserD_GroupA" = {
    users           = ["S16_UserD"]
    inline_policies = {
      "S16_IP_UserD_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["elasticbeanstalk:AssociateEnvironmentOperationsRole","elasticbeanstalk:DescribeApplications"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyU"]
  }
}

roles = {
  "S16_UserA_RoleA" = {
    assume_users    = ["S16_UserA"]
    assume_roles    = []
    inline_policies = {
      "S16_IP_UserA_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListAttachedUserPolicies","ec2:AllocateAddress","controltower:CreateManagedAccount"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyT"]
  }

  "S16_UserA_RoleB" = {
    assume_users    = []
    assume_roles    = ["S16_UserA_RoleA"]
    inline_policies = {
      "S16_IP_UserA_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:GetUserPolicy","iotanalytics:UpdateDatastore","iotanalytics:UpdatePipeline"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy"]
  }

  "S16_UserB_RoleA" = {
    assume_users    = ["S16_UserB"]
    assume_roles    = []
    inline_policies = {
      "S16_IP_UserB_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["ram:CreatePermission","cloudfront:AssociateAlias","iam:ListAttachedGroupPolicies"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyE"]
  }

  "S16_UserB_RoleB" = {
    assume_users    = []
    assume_roles    = ["S16_UserB_RoleA"]
    inline_policies = {
      "S16_IP_UserB_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["connect:ActivateEvaluationForm","connect:AssociateBot"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy"]
  }

  "S16_UserB_RoleC" = {
    assume_users    = []
    assume_roles    = ["S16_UserB_RoleB"]
    inline_policies = {
      "S16_IP_UserB_RoleC" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:GetRolePolicy"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"]
  }

  "S16_UserC_RoleA" = {
    assume_users    = ["S16_UserC"]
    assume_roles    = []
    inline_policies = {
      "S16_IP_UserC_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListRolePolicies"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyO"]
  }

  "S16_UserC_RoleB" = {
    assume_users    = []
    assume_roles    = ["S16_UserC_RoleA"]
    inline_policies = {
      "S16_IP_UserC_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["cloudfront:DisassociateDistributionWebACL"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"]
  }

  "S16_UserC_RoleC" = {
    assume_users    = []
    assume_roles    = ["S16_UserC_RoleB"]
    inline_policies = {
      "S16_IP_UserC_RoleC" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["s3-object-lambda:GetObjectAcl","iam:GetPolicyVersions"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S16_AMP_PolicyJ"]
  }

  "S16_UserD_RoleA" = {
    assume_users    = ["S16_UserD"]
    assume_roles    = []
    inline_policies = {
      "S16_IP_UserD_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["sns:Publish","sns:DeleteTopic"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess","S16_AMP_PolicyZ"]
  }

  "S16_UserD_RoleB" = {
    assume_users    = []
    assume_roles    = ["S16_UserD_RoleA"]
    inline_policies = {
      "S16_IP_UserD_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["lookoutequipment:DescribeDataset","logs:CreateDelivery"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"]
  }

  "S16_UserD_RoleC" = {
    assume_users    = []
    assume_roles    = ["S16_UserD_RoleB"]
    inline_policies = {
      "S16_IP_UserD_RoleC" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["lookoutequipment:ListInferenceEvents"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy"]
  }

  "S16_UserD_RoleD" = {
    assume_users    = []
    assume_roles    = ["S16_UserD_RoleC"]
    inline_policies = {
      "S16_IP_UserD_RoleD" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["drs:CreateSourceNetwork","iam:GetAccountAuthorizationDetails"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess"]
  }
}
