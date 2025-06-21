resource "aws_iam_policy" "this" {
  name        = var.name
  description = var.description
  policy      = var.policy
}