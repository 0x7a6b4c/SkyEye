managed_policies = {
  "S20_AMP_PolicyA" = {
    description = "IoT DeleteThing & Bedrock DeleteGuardrail"
    policy = {
      Version   = "2012-10-17"
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
  "S20_AMP_PolicyB" = {
    description = "Bedrock InvokeAgent & UpdateFlow"
    policy = {
      Version   = "2012-10-17"
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
  "S20_AMP_PolicyC" = {
    description = "ActivateDeviceIdentifier & UpdateAssessment"
    policy = {
      Version   = "2012-10-17"
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
  "S20_AMP_PolicyT" = {
    description = "SSM CancelCommand & GlobalAccelerator CreateAccelerator"
    policy = {
      Version   = "2012-10-17"
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
  "S20_AMP_PolicyD" = {
    description = "Codecatalyst DeleteConnection & CodeGuru FreeTrialSummary"
    policy = {
      Version   = "2012-10-17"
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
  "S20_AMP_PolicyX" = {
    description = "GlobalAccelerator DeleteAccelerator & CodeDeploy BatchGetApplications"
    policy = {
      Version   = "2012-10-17"
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
  "S20_AMP_PolicyE" = {
    description = "S3 ListBucket & EC2 DescribeInstances"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "s3:ListBucket",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    }
  }
  "S20_AMP_PolicyF" = {
    description = "ListAttachedRolePolicies, GetGroupPolicy & ListGroupPolicies"
    policy = {
      Version   = "2012-10-17"
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
  "S20_AMP_PolicyG" = {
    description = "CloudFront CreatePublicKey & CopyDistribution"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "cloudfront:CreatePublicKey",
          "cloudfront:CopyDistribution"
        ]
        Resource = "*"
      }]
    }
  }
  "S20_AMP_PolicyJ" = {
    description = "Tax GetExemptions & EC2 BundleInstance"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "tax:GetExemptions",
          "ec2:BundleInstance"
        ]
        Resource = "*"
      }]
    }
  }
  "S20_AMP_PolicyY" = {
    description = "SNS SetTopicAttributes & CreateTopic"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "sns:SetTopicAttributes",
          "sns:CreateTopic"
        ]
        Resource = "*"
      }]
    }
  }
  "S20_AMP_PolicyU" = {
    description = "ElasticBeanstalk RemoveTags & TerminateEnvironment"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "elasticbeanstalk:RemoveTags",
          "elasticbeanstalk:TerminateEnvironment"
        ]
        Resource = "*"
      }]
    }
  }
  "S20_AMP_PolicyZ" = {
    description = "ElasticBeanstalk DeletePlatformVersion & DescribeEvents"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "elasticbeanstalk:DeletePlatformVersion",
          "elasticbeanstalk:DescribeEvents"
        ]
        Resource = "*"
      }]
    }
  }
  "S20_AMP_PolicyO" = {
    description = "RAM CreateResourceShare"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect = "Allow"
        Action = [
          "ram:CreateResourceShare"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S20_UserA" = {
    inline_policies = {
      "S20_IP_UserA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListGroupsForUser"]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S20_AMP_PolicyA", "S20_AMP_PolicyB"]
    groups            = ["S20_UserA_GroupA"]
    create_access_key = true
  }
  "S20_UserB" = {
    inline_policies = {
      "S20_IP_UserB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListUserPolicies"]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S20_AMP_PolicyD"]
    groups            = ["S20_UserB_GroupA"]
    create_access_key = true
  }
  "S20_UserC" = {
    inline_policies = {
      "S20_IP_UserC" = {
        Version   = "2012-10-17"
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
    managed_policies  = ["S20_AMP_PolicyF"]
    groups            = ["S20_UserC_GroupA"]
    create_access_key = true
  }
  "S20_UserD" = {
    inline_policies = {
      "S20_IP_UserD" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "sns:CreatePlatformEndpoint",
            "sns:CreatePlatformApplication"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S20_AMP_PolicyY"]
    groups            = ["S20_UserD_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S20_UserA_GroupA" = {
    users = ["S20_UserA"]
    inline_policies = {
      "S20_IP_UserA_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListRoles",
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:RunInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyC"]
  }
  "S20_UserB_GroupA" = {
    users = ["S20_UserB"]
    inline_policies = {
      "S20_IP_UserB_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["drs:DeleteJob"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyX"]
  }
  "S20_UserC_GroupA" = {
    users = ["S20_UserC"]
    inline_policies = {
      "S20_IP_UserC_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "cloudfront:CreateKeyGroup",
            "cloudfront:CreateKeyValueStore"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyG"]
  }
  "S20_UserD_GroupA" = {
    users = ["S20_UserD"]
    inline_policies = {
      "S20_IP_UserD_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "elasticbeanstalk:AssociateEnvironmentOperationsRole",
            "elasticbeanstalk:DescribeApplications"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyU"]
  }
}

roles = {
  "S20_UserA_RoleA" = {
    assume_users    = ["S20_UserA"]
    assume_roles    = []
    inline_policies = {
      "S20_IP_UserA_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListAttachedUserPolicies",
            "ec2:AllocateAddress",
            "controltower:CreateManagedAccount"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyT"]
  }
  "S20_UserA_RoleB" = {
    assume_users    = []
    assume_roles    = ["S20_UserA_RoleA"]
    inline_policies = {
      "S20_IP_UserA_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:GetUserPolicy",
            "iotanalytics:UpdateDatastore",
            "iotanalytics:UpdatePipeline"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy"]
  }
  "S20_UserB_RoleA" = {
    assume_users    = ["S20_UserB"]
    assume_roles    = []
    inline_policies = {
      "S20_IP_UserB_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "ram:CreatePermission",
            "cloudfront:AssociateAlias",
            "iam:ListAttachedGroupPolicies"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyE"]
  }
  "S20_UserB_RoleB" = {
    assume_users    = []
    assume_roles    = ["S20_UserB_RoleA"]
    inline_policies = {
      "S20_IP_UserB_RoleB" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "connect:ActivateEvaluationForm",
            "connect:AssociateBot"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["arn:aws:iam::aws:policy/AmazonEKSServicePolicy"]
  }
  "S20_UserB_RoleC" = {
    assume_users    = []
    assume_roles    = ["S20_UserB_RoleB"]
    inline_policies = {
      "S20_IP_UserB_RoleC" = {
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
  "S20_UserC_RoleA" = {
    assume_users    = ["S20_UserC"]
    assume_roles    = []
    inline_policies = {
      "S20_IP_UserC_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["iam:ListRolePolicies"]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyO"]
  }
  "S20_UserC_RoleB" = {
    assume_users    = []
    assume_roles    = ["S20_UserC_RoleA"]
    inline_policies = {
      "S20_IP_UserC_RoleB" = {
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
  "S20_UserC_RoleC" = {
    assume_users    = []
    assume_roles    = ["S20_UserC_RoleB"]
    inline_policies = {
      "S20_IP_UserC_RoleC" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "s3-object-lambda:GetObjectAcl",
            "iam:GetPolicyVersion"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S20_AMP_PolicyJ"]
  }
  "S20_UserD_RoleA" = {
    assume_users    = ["S20_UserD"]
    assume_roles    = []
    inline_policies = {
      "S20_IP_UserD_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = ["sns:Publish", "sns:DeleteTopic"]
          Resource = "*"
        }]
      }
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      "S20_AMP_PolicyZ"
    ]
  }
}
