variable "name" { type = string }
variable "inline_policies" {
  type = map(string)
  default = {}
}
variable "managed_policy_arns" {
  type = list(string)
  default = []
}