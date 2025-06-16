module "iam_users" {
  source = "./modules/iam_user"
  for_each = var.users

  name             = each.key
  inline_policies  = each.value.inline_policies
  managed_policies = each.value.managed_policies
}

module "iam_groups" {
  source = "./modules/iam_group"
  for_each = var.groups

  name                = each.key
  inline_policies     = each.value.inline_policies
  managed_policy_arns = each.value.managed_policies
}

resource "aws_iam_group_membership" "group_membership" {
  for_each = var.groups

  name  = "${each.key}-membership"
  group = module.iam_groups[each.key].name
  users = each.value.users
}

module "iam_roles" {
  source = "./modules/iam_role"
  for_each = var.roles

  name               = each.key
  assume_role_policy = each.value.assume_role_policy
  inline_policies    = each.value.inline_policies
  managed_policy_arns = each.value.managed_policies
}

module "iam_policies" {
  source = "./modules/iam_policy"
  for_each = var.managed_policies

  name        = each.key
  description = each.value.description
  policy      = each.value.policy
}
