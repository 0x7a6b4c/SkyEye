users = {
  "S8_UserA" = {
    inline_policies = {
      "S8_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["aiops:CreateInvestigation","iot:CreateThing"], Resource = "*" } ]
      })
    }
    managed_policies = [
      module.iam_policies["S8_AMP_PolicyA"].arn,
      module.iam_policies["S8_AMP_PolicyB"].arn
    ]
  }
}

groups = {
  "S8_GroupA" = {
    users = ["S8_UserA"]
    inline_policies = {
      "S8_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iam:ListRoles","s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"], Resource = "*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S8_AMP_PolicyC"].arn ]
  }
}

roles = {
  "S8_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_user.S8_UserA.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S8_IP_RoleA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iam:ListGroupsForUser","iam:ListAttachedUserPolicies","iam:GetUserPolicy"], Resource = "*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S8_AMP_PolicyD"].arn ]
  }
  "S8_RoleB" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_role.S8_RoleA.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S8_IP_RoleB" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iam:ListUserPolicies","iam:ListAttachedGroupPolicies","iam:GetRolePolicy"], Resource = "*" } ]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
      module.iam_policies["S8_AMP_PolicyE"].arn
    ]
  }
  "S8_RoleC" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_role.S8_RoleB.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S8_IP_RoleC" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["controltower:CreateManagedAccount","nimble:CreateStudio"], Resource = "*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S8_AMP_PolicyF"].arn ]
  }
  "S8_RoleD" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_role.S8_RoleC.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S8_IP_RoleD" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["tax:GetExemptions","s3-object-lambda:GetObjectAcl","qapps:CreateLibraryItemReview"], Resource = "*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S8_AMP_PolicyG"].arn ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S8_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iot:DeleteThing","bedrock:DeleteGuardrail"],Resource="*"}]} )},
    "S8_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["bedrock:InvokeAgent","bedrock:UpdateFlow"],Resource="*"}]} )},
    "S8_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["s3:ListBuckets","ec2:DescribeInstances"],Resource="*"}]} )},
    "S8_AMP_PolicyD" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ssm:CancelCommand","codeguru:GetCodeGuruFreeTrialSummary"],Resource="*"}]} )},
    "S8_AMP_PolicyE" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ec2:AllocateAddress","ec2:BundleInstance"],Resource="*"}]} )},
    "S8_AMP_PolicyF" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListAttachedRolePolicies","iam:GetGroupPolicy","iam:ListGroupPolicies"],Resource="*"}]} )},
    "S8_AMP_PolicyG" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:ListPolicyVersions","iam:ListRolePolicies","iam:GetPolicyVersions"],Resource="*"}]} )}
  }
)
