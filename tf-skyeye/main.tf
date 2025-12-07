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
          : (startswith(p, "arn:aws:") ? p : "arn:aws:iam::aws:policy/${p}")
  }
  create_access_key  = lookup(each.value, "create_access_key", false)
}

# 3) Groups
module "iam_groups" {
  source         = "./modules/iam_group"
  for_each       = var.groups

  name               = each.key
  inline_policies    = { for k, v in try(each.value.inline_policies, {}) : k => jsonencode(v) }
  managed_policies   = {
    for p in try(each.value.managed_policies, []) :
    p => contains(keys(var.managed_policies), p)
          ? module.iam_policies[p].arn
          : (startswith(p, "arn:aws:") ? p : "arn:aws:iam::aws:policy/${p}")
  }
}

resource "aws_iam_group_membership" "all" {
  for_each = {
    for group_name, group in var.groups :
    group_name => {
      users = try(group.users, [])
    }
    if length(try(group.users, [])) > 0
  }

  name  = "${each.key}-membership"
  group = each.key
  users = each.value.users

  depends_on = [
    module.iam_users,
    module.iam_groups
  ]
}

locals {
  role_configs = {
    for name, role in var.roles :
    name => {
      assume_role_policy = jsonencode({
        Version   = "2012-10-17"
        Statement = concat(
          [
            for u in try(role.assume_users, []) : {
              Effect    = "Allow"
              Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.me.account_id}:user/${u}" }
              Action    = "sts:AssumeRole"
            }
          ],
          [
            for r in try(role.assume_roles, []) : {
              Effect    = "Allow"
              Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.me.account_id}:role/${r}" }
              Action    = "sts:AssumeRole"
            }
          ]
        )
      })

      inline_policies = { for k, v in try(role.inline_policies, {}) : k => jsonencode(v) }

      managed_policies = {
        for p in try(role.managed_policies, []) :
        p => contains(keys(var.managed_policies), p)
          ? module.iam_policies[p].arn
          : (startswith(p, "arn:aws:") ? p : "arn:aws:iam::aws:policy/${p}")
      }
    }
  }

  role_parents = {
    for name, role in var.roles :
    name => toset(try(role.assume_roles, []))
  }

  role_level0 = {
    for name, role in var.roles : name => role
    if length(local.role_parents[name]) == 0
  }
  role_keys_level0 = keys(local.role_level0)

  role_level1 = {
    for name, role in var.roles : name => role
    if length(local.role_parents[name]) > 0
      && !contains(local.role_keys_level0, name)
      && alltrue([for parent in local.role_parents[name] : contains(local.role_keys_level0, parent)])
  }
  role_keys_level1 = distinct(concat(local.role_keys_level0, keys(local.role_level1)))

  role_level2 = {
    for name, role in var.roles : name => role
    if length(local.role_parents[name]) > 0
      && !contains(local.role_keys_level1, name)
      && alltrue([for parent in local.role_parents[name] : contains(local.role_keys_level1, parent)])
  }
  role_keys_level2 = distinct(concat(local.role_keys_level1, keys(local.role_level2)))

  role_level3 = {
    for name, role in var.roles : name => role
    if length(local.role_parents[name]) > 0
      && !contains(local.role_keys_level2, name)
      && alltrue([for parent in local.role_parents[name] : contains(local.role_keys_level2, parent)])
  }
  role_keys_level3 = distinct(concat(local.role_keys_level2, keys(local.role_level3)))

  role_level4 = {
    for name, role in var.roles : name => role
    if length(local.role_parents[name]) > 0
      && !contains(local.role_keys_level3, name)
      && alltrue([for parent in local.role_parents[name] : contains(local.role_keys_level3, parent)])
  }
  role_keys_level4 = distinct(concat(local.role_keys_level3, keys(local.role_level4)))

  roles_unassigned = setsubtract(keys(var.roles), local.role_keys_level4)
}

module "iam_roles_level0" {
  source   = "./modules/iam_role"
  for_each = local.role_level0

  name               = each.key
  assume_role_policy = local.role_configs[each.key].assume_role_policy
  inline_policies    = local.role_configs[each.key].inline_policies
  managed_policies   = local.role_configs[each.key].managed_policies

  depends_on = [
    module.iam_users,
    module.iam_groups,
    aws_iam_group_membership.all
  ]
}

module "iam_roles_level1" {
  source   = "./modules/iam_role"
  for_each = local.role_level1

  name               = each.key
  assume_role_policy = local.role_configs[each.key].assume_role_policy
  inline_policies    = local.role_configs[each.key].inline_policies
  managed_policies   = local.role_configs[each.key].managed_policies

  depends_on = [module.iam_roles_level0]
}

module "iam_roles_level2" {
  source   = "./modules/iam_role"
  for_each = local.role_level2

  name               = each.key
  assume_role_policy = local.role_configs[each.key].assume_role_policy
  inline_policies    = local.role_configs[each.key].inline_policies
  managed_policies   = local.role_configs[each.key].managed_policies

  depends_on = [module.iam_roles_level0, module.iam_roles_level1]
}

module "iam_roles_level3" {
  source   = "./modules/iam_role"
  for_each = local.role_level3

  name               = each.key
  assume_role_policy = local.role_configs[each.key].assume_role_policy
  inline_policies    = local.role_configs[each.key].inline_policies
  managed_policies   = local.role_configs[each.key].managed_policies

  depends_on = [module.iam_roles_level0, module.iam_roles_level1, module.iam_roles_level2]
}

module "iam_roles_level4" {
  source   = "./modules/iam_role"
  for_each = local.role_level4

  name               = each.key
  assume_role_policy = local.role_configs[each.key].assume_role_policy
  inline_policies    = local.role_configs[each.key].inline_policies
  managed_policies   = local.role_configs[each.key].managed_policies

  depends_on = [module.iam_roles_level0, module.iam_roles_level1, module.iam_roles_level2, module.iam_roles_level3]
}

check "role_dependency_resolution" {
  assert {
    condition     = length(local.roles_unassigned) == 0
    error_message = "Unable to determine dependency order for roles: ${join(", ", local.roles_unassigned)}"
  }
}