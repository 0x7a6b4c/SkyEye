data "aws_caller_identity" "me" {}

# 1) Create custom managed policies
module "iam_policies" {
  source    = "./modules/iam_policy"
  for_each  = var.managed_policies

  name        = each.key
  description = each.value.description
  policy      = jsonencode(each.value.policy)
}

# 2) Users
module "iam_users" {
  source         = "./modules/iam_user"
  for_each       = var.users

  name               = each.key
  inline_policies    = { for k, v in try(each.value.inline_policies, {}) : k => jsonencode(v) }
  managed_policies   = {
    for p in try(each.value.managed_policies, []) :
    p => contains(keys(var.managed_policies), p)
      ? module.iam_policies[p].arn
      : "arn:aws:iam::aws:policy/${p}"
  }
  create_access_key  = lookup(each.value, "create_access_key", false)
}

# 3) Groups
module "iam_groups" {
  source         = "./modules/iam_group"
  for_each       = var.groups

  name               = each.key
  users              = try(each.value.users, [])
  inline_policies    = { for k, v in try(each.value.inline_policies, {}) : k => jsonencode(v) }
  managed_policies   = {
    for p in try(each.value.managed_policies, []) :
    p => contains(keys(var.managed_policies), p)
      ? module.iam_policies[p].arn
      : "arn:aws:iam::aws:policy/${p}"
  }
}

# 4) Roles
module "iam_roles" {
  source   = "./modules/iam_role"
  for_each = var.roles

  name = each.key

  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = concat(
      [
        for u in try(each.value.assume_users, []) : {
          Effect    = "Allow"
          Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.me.account_id}:user/${u}" }
          Action    = "sts:AssumeRole"
        }
      ],
      [
        for r in try(each.value.assume_roles, []) : {
          Effect    = "Allow"
          Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.me.account_id}:role/${r}" }
          Action    = "sts:AssumeRole"
        }
      ]
    )
  })

  inline_policies  = { for k, v in try(each.value.inline_policies, {}) : k => jsonencode(v) }
  managed_policies = {
    for p in try(each.value.managed_policies, []) :
    p => contains(keys(var.managed_policies), p)
      ? module.iam_policies[p].arn
      : "arn:aws:iam::aws:policy/${p}"
  }
}