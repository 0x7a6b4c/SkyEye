users = {
  "S10_UserA" = {
    inline_policies = {
      "S10_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["tax:GetExemptions","s3-object-lambda:GetObjectAcl"], Resource = "*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S10_AMP_PolicyA"].arn ]
  }
}

groups = {
  "S10_GroupA" = {
    users = ["S10_UserA"]
    inline_policies = {
      "S10_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iot:DeleteThing","bedrock:DeleteGuardrail","iam:ListRoles"], Resource = "*" } ]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonKinesisFullAccess",
      module.iam_policies["S10_AMP_PolicyB"].arn
    ]
  }
}

roles = {
  "S10_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_user.S10_UserA.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S10_IP_RoleA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iam:GetAccountAuthorizationDetails"], Resource = "*" } ]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonEKSServicePolicy",
      module.iam_policies["S10_AMP_PolicyC"].arn
    ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S10_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:CreateInvestigation","iot:CreateThing"],Resource="*"}]} )},
    "S10_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["bedrock:InvokeAgent","bedrock:UpdateFlow","iam:ListRoles"],Resource="*"}]} )},
    "S10_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"],Resource="*"}]} )}
  }
)
