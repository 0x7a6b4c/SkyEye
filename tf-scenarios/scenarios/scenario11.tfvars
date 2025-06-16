users = {
  "S11_UserA" = {
    inline_policies = {
      "S11_IP_UserA" = jsonencode({
        Version = "2012-10-17",
        Statement = [
          { Effect = "Allow", Action = ["tax:GetExemptions","s3-object-lambda:GetObjectAcl"], Resource = "*" }
        ]
      })
    }
    managed_policies = [ module.iam_policies["S11_AMP_PolicyA"].arn ]
  }
}

groups = {
  "S11_GroupA" = {
    users = ["S11_UserA"]
    inline_policies = {
      "S11_IP_GroupA" = jsonencode({
        Version = "2012-10-17",
        Statement = [ { Effect = "Allow", Action = ["iot:DeleteThing","bedrock:DeleteGuardrail"], Resource = "*" } ]
      })
    }
    managed_policies = [
      "arn:aws:iam::aws:policy/AmazonKinesisFullAccess",
      module.iam_policies["S11_AMP_PolicyB"].arn
    ]
  }
}

roles = {
  "S11_RoleA" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_user.S11_UserA.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S11_IP_RoleA" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ssm:CancelCommand","codeguru:GetCodeGuruFreeTrialSummary"],Resource="*"}]}) }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonEKSServicePolicy", module.iam_policies["S11_AMP_PolicyC"].arn ]
  }
  "S11_RoleB" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_role.S11_RoleA.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S11_IP_RoleB" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["detective:AcceptInvitation","transfer:CreateAccess"],Resource="*"}]}) }
    managed_policies = [ "arn:aws:iam::aws:policy/AmazonEKSServicePolicy", module.iam_policies["S11_AMP_PolicyE"].arn ]
  }
  "S11_RoleC" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_role.S11_RoleB.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S11_IP_RoleC" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["controltower:CreateManagedAccount","nimble:CreateStudio"],Resource="*"}]}) }
    managed_policies = [ module.iam_policies["S11_AMP_PolicyF"].arn ]
  }
  "S11_RoleD" = {
    assume_role_policy = jsonencode({ Version="2012-10-17",Statement=[{Effect="Allow",Principal={AWS=aws_iam_role.S11_RoleC.arn},Action="sts:AssumeRole"}] })
    inline_policies = { "S11_IP_RoleD" = jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["tax:GetExemptions","s3-object-lambda:GetObjectAcl"],Resource="*"}]}) }
    managed_policies = [ module.iam_policies["S11_AMP_PolicyG"].arn ]
  }
}

managed_policies = merge(
  var.managed_policies,
  {
    "S11_AMP_PolicyA" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["aiops:CreateInvestigation","iot:CreateThing","iam:ListRoles"],Resource="*"}]})},
    "S11_AMP_PolicyB" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["bedrock:InvokeAgent","bedrock:UpdateFlow"],Resource="*"}]})},
    "S11_AMP_PolicyC" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["s3:CreateBucket","lambda:CreateFunction","ec2:CreateInstances"],Resource="*"}]})},
    "S11_AMP_PolicyE" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["ec2:AllocateAddress","ec2:BundleInstance"],Resource="*"}]})},
    "S11_AMP_PolicyF" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["cloud9:CreateEnvironmentMembership","cloud9:CreateEnvironmentSSH"],Resource="*"}]})},
    "S11_AMP_PolicyG" = { description="", policy=jsonencode({Version="2012-10-17",Statement=[{Effect="Allow",Action=["iam:GetAccountAuthorizationDetails"],Resource="*"}]})}
  }
)
