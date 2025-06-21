managed_policies = {
  "S1_AMP_PolicyA" = {
    description = "ListUserPolicies, ListAttachedGroupPolicies, GetRolePolicy"
    policy = {
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
  "S1_AMP_PolicyB" = {
    description = "GetGroupPolicy, ListGroupPolicies"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:GetGroupPolicy",
          "iam:ListGroupPolicies"
        ]
        Resource = "*"
      }]
    }
  }
  "S1_AMP_PolicyC" = {
    description = "GetPolicyVersion, ListAttachedRolePolicies, ListRoles"
    policy = {
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = [
          "iam:GetPolicyVersion",
          "iam:ListAttachedRolePolicies",
          "iam:ListRoles"
        ]
        Resource = "*"
      }]
    }
  }
}

users = {
  "S1_UserA" = {
    inline_policies = {
      "S1_IP_UserA" = {
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
    managed_policies  = ["S1_AMP_PolicyA", "S1_AMP_PolicyB"]
    groups            = ["S1_GroupA"]
    create_access_key = true
  }
}

groups = {
  "S1_GroupA" = {
    users = ["S1_UserA"]
    inline_policies = {
      "S1_IP_GroupA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "iam:ListPolicyVersions",
            "iam:ListRolePolicies"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["S1_AMP_PolicyC"]
  }
}

roles = {
  "S1_RoleA" = {
    assume_users    = ["S1_UserA"]
    assume_roles    = []
    inline_policies = {
      "S1_IP_RoleA" = {
        Version = "2012-10-17"
        Statement = [{
          Effect   = "Allow"
          Action   = [
            "s3:CreateBucket",
            "lambda:CreateFunction",
            "ec2:RunInstances"
          ]
          Resource = "*"
        }]
      }
    }
    managed_policies = ["AmazonEKSServicePolicy"]
  }
}
