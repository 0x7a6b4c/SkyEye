output "users_created" {
  value = { for k, v in module.iam_users : k => v.user_name }
}

output "groups_created" {
  value = { for k, v in module.iam_groups : k => v.name }
}

output "roles_created" {
  value = { for k, v in module.iam_roles : k => v.name }
}

output "managed_policies_arns" {
  value = { for k, v in module.iam_policies : k => v.arn }
}
