resource "aws_iam_group" "this" {
  name = var.name
}

resource "aws_iam_group_policy" "inline" {
  for_each = var.inline_policies
  name     = each.key
  group    = aws_iam_group.this.name
  policy   = each.value
}

resource "aws_iam_group_policy_attachment" "managed" {
  for_each   = var.managed_policies
  policy_arn = each.value
  group      = aws_iam_group.this.name
}


# resource "aws_iam_group_membership" "this" {
#   name  = "${var.name}-membership"
#   group = aws_iam_group.this.name
#   users = var.users

# }
