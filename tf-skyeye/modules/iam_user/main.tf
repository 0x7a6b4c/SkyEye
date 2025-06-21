resource "aws_iam_user" "this" {
  name = var.name
}

# Inline policies
resource "aws_iam_user_policy" "inline" {
  for_each = var.inline_policies

  name   = each.key
  user   = aws_iam_user.this.name
  policy = each.value
}

# Managed policy attachments
resource "aws_iam_user_policy_attachment" "managed" {
  for_each   = var.managed_policies
  policy_arn = each.value
  user       = aws_iam_user.this.name
}

# Optional access key (for testing tools)
resource "aws_iam_access_key" "this" {
  count = var.create_access_key ? 1 : 0
  user  = aws_iam_user.this.name
}
