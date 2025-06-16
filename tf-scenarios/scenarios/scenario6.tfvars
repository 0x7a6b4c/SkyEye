users = {
  "S6_UserA" = {
    inline_policies = {
      "S6_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          {
            Effect = "Allow",
            Action = ["iam:ListGroupsForUser","iam:GetUserPolicy","iam:ListUserPolicies","iam:GetRolePolicy","iam:GetGroupPolicy","iam:ListGroupPolicies","iam:ListPolicies"],
            Resource = "*"
          }
        ]
      })
    }
    managed_policies = [
      module.iam_policies["S6_AMP_PolicyA"].arn,
      module.iam_policies["S6_AMP_PolicyB"].arn
    ]
  }
}

groups = {
  "S6_GroupA" = {
    users = ["S6_UserA"]
    inline_policies = {
      "S6_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          { Effect = "Allow", Action = ["iam:ListRolePolicies","iam:ListPolicyVersions","iam:GetPolicyVersions","iam:ListRoles"], Resource = "*" }
        ]
      })
    }
    managed_policies = [
      module.iam_policies["S6_AMP_PolicyC"].arn,
      module.iam_policies["S6_AMP_PolicyD"].arn,
      "arn:aws:iam::aws:policy/AmazonMQFullAccess"
    ]
  }
}

roles = {
  "S6_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_user.S6_UserA.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S6_IP_RoleA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances","s3:ListBuckets","ec2:DescribeInstances"], Resource = "*" } ]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
      "arn:aws:iam::aws:policy/AmazonKinesisFullAccess",
      module.iam_policies["S6_AMP_PolicyE"].arn,
      module.iam_policies["S6_AMP_PolicyF"].arn
    ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S6_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:UpdateInvestigation","iot:AttachThingPrincipal"],Resource="*"}]} )},
    "S6_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iot:DeleteThing","bedrock:DeleteGuardrail"],Resource="*"}]} )},
    "S6_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:CreateInvestigation","iot:CreateThing"],Resource="*"}]} )},
    "S6_AMP_PolicyD" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:CreateInvestigationResource","qapps:CreateLibraryItemReview"],Resource="*"}]} )},
    "S6_AMP_PolicyE" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["private-networks:ActivateDeviceIdentifier","auditmanager:UpdateAssessment"],Resource="*"}]} )},
    "S6_AMP_PolicyF" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iot:CancelJob","fis:CreateExperimentTemplate"],Resource="*"}]} )}
  }
)
