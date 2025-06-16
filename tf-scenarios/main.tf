data "aws_caller_identity" "me" {}

# 1) Create custom managed policies
module "iam_policies" {
  source   = "./modules/iam_policy"
  for_each = var.managed_policies

  name        = each.key
  description = each.value.description
  policy      = jsonencode(each.value.policy)
}

# 2) Users
module "iam_users" {
  source   = "./modules/iam_user"
  for_each = var.users

  name                = each.key
  inline_policies     = each.value.inline_policies
  managed_policy_arns = {
    for mp in each.value.managed_policies :
    mp => contains(keys(var.managed_policies), mp)
      ? module.iam_policies[mp].arn
      : mp
  }
}

# 3) Groups
module "iam_groups" {
  source   = "./modules/iam_group"
  for_each = var.groups

  name                = each.key
  users               = each.value.users
  inline_policies     = each.value.inline_policies
  managed_policy_arns = {
    for mp in each.value.managed_policies :
    mp => contains(keys(var.managed_policies), mp)
      ? module.iam_policies[mp].arn
      : mp
  }
}

# 4) Roles
module "iam_roles" {
  source   = "./modules/iam_role"
  for_each = var.roles

  name               = each.key
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        AWS = concat(
          [ for u in each.value.assume_users : "arn:aws:iam::${data.aws_caller_identity.me.account_id}:user/${u}" ],
          [ for r in each.value.assume_roles : "arn:aws:iam::${data.aws_caller_identity.me.account_id}:role/${r}" ]
        )
      }
      Action = "sts:AssumeRole"
    }]
  })
  inline_policies     = each.value.inline_policies
  managed_policy_arns = {
    for mp in each.value.managed_policies :
    mp => contains(keys(var.managed_policies), mp)
      ? module.iam_policies[mp].arn
      : mp
  }
}