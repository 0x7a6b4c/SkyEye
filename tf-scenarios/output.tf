output "user_names" {
  value = keys(var.users)
}

output "group_names" {
  value = keys(var.groups)
}

output "role_names" {
  value = keys(var.roles)
}

output "custom_policy_arns" {
  value = { for k, m in module.iam_policies : k => m.arn }
}
