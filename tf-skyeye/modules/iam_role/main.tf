resource "aws_iam_role" "this" {
  name               = var.name
  assume_role_policy = var.assume_role_policy
}

resource "aws_iam_role_policy" "inline" {
  for_each = var.inline_policies
  name     = each.key
  role     = aws_iam_role.this.name
  policy   = each.value
}

resource "aws_iam_role_policy_attachment" "managed" {
  for_each   = var.managed_policies
  policy_arn = each.value
  role       = aws_iam_role.this.name
}