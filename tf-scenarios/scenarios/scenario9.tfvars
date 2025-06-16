users = {
  "S9_UserA" = {
    inline_policies = {
      "S9_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iam:GetAccountAuthorizationDetails"], Resource = "*" } ]
      })
    }
    managed_policies = [ module.iam_policies["S9_AMP_PolicyA"].arn ]
  }
}

groups = {
  "S9_GroupA" = {
    users = ["S9_UserA"]
    inline_policies = {
      "S9_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iot:DeleteThing","bedrock:DeleteGuardrail"], Resource = "*" } ]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonKinesisFullAccess",
      module.iam_policies["S9_AMP_PolicyB"].arn
    ]
  }
}

roles = {
  "S9_RoleA" = {
    assume_role_policy = jsonencode({
      Version = "2012-10-17",
      Statement = [ { Effect = "Allow", Principal = { AWS = aws_iam_user.S9_UserA.arn }, Action = "sts:AssumeRole" } ]
    })
    inline_policies = {
      "S9_IP_RoleA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"], Resource = "*" } ]
      })
    }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonEKSServicePolicy" ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S9_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:CreateInvestigation","iot:CreateThing"],Resource="*"}]} )},
    "S9_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["bedrock:InvokeAgent","bedrock:UpdateFlow"],Resource="*"}]} )}
  }
)
