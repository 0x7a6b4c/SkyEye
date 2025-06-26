managed_policies = {
  "S22_AMP_PolicyA" = {
    description = "RDS DescribeDBInstances & DescribeDBClusters"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBClusters"
        ]
        Resource = "*"
      }]
    }
  }
  "S22_AMP_PolicyB" = {
    description = "EC2 DescribeAddresses, BundleTasks & Instances"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "ec2:DescribeAddresses",
          "ec2:DescribeBundleTasks",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }]
    }
  }
  "S22_AMP_PolicyC" = {
    description = "S3 ListBucket & CloudFormation ListStacks"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "s3:ListBucket",
          "cloudformation:ListStacks"
        ]
        Resource = "*"
      }]
    }
  }
  "S22_AMP_PolicyD" = {
    description = "Glue ListSessions & ListStatements"
    policy = {
      Version   = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "glue:ListSessions",
          "glue:ListStatements"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S22_UserA" = {
    inline_policies = {
      "S22_IP_UserA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "rds:DescribeDBSnapshots",
            "rds:DescribeDBSecurityGroups"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies  = ["S22_AMP_PolicyA", "S22_AMP_PolicyB"]
    groups            = ["S22_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S22_GroupA" = {
    users = ["S22_UserA"]
    inline_policies = {
      "S22_IP_GroupA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "lambda:ListLayers",
            "lambda:ListFunctions"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S22_AMP_PolicyC"]
  }
}

roles = {
  "S22_RoleA" = {
    assume_users    = ["S22_UserA"]
    assume_roles    = []
    inline_policies = {
      "S22_IP_RoleA" = {
        Version   = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "s3:ListBucket",
            "mgh:DescribeApplicationState"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S22_AMP_PolicyD"]
  }
}
