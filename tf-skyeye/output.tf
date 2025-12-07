output "custom_policy_arns" {
  description = "ARNs of all custom policies created"
  value       = { for k, m in module.iam_policies : k => m.arn }
}

output "user_credentials" {
  description = "Credentials for any user with create_access_key = true"
  value = {
    for u, m in module.iam_users :
    u => {
      user_name         = m.user_name
      access_key_id     = try(m.access_key_id, "")
      secret_access_key = try(m.secret_access_key, "")
    }
  }
  sensitive = true
}

output "user_names" {
  description = "All IAM user names created"
  value       = keys(module.iam_users)
}

output "group_names" {
  description = "All IAM group names created"
  value       = keys(module.iam_groups)
}

output "role_names" {
  description = "All IAM role names created"
  value = distinct(concat(
    keys(module.iam_roles_level0),
    keys(module.iam_roles_level1),
    keys(module.iam_roles_level2),
    keys(module.iam_roles_level3),
    keys(module.iam_roles_level4)
  ))
}

output "region" {
  value = var.aws_region
}