output "user_name" {
  value = aws_iam_user.this.name
}

output "access_key_id" {
  description = "Access key ID (if created)"
  value       = try(aws_iam_access_key.this[0].id, "")
  sensitive   = true
}

output "secret_access_key" {
  description = "Secret access key (if created)"
  value       = try(aws_iam_access_key.this[0].secret, "")
  sensitive   = true
}