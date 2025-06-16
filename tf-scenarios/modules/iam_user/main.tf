resource "aws_iam_user" "this" {
  name = var.name
}

resource "aws_iam_user_policy" "inline" {
  for_each = var.inline_policies
  name     = each.key
  user     = aws_iam_user.this.name
  policy   = jsonencode(each.value)
}

resource "aws_iam_user_policy_attachment" "managed" {
  for_each = toset(var.managed_policies)
  user     = aws_iam_user.this.name
  policy_arn = each.value
}
