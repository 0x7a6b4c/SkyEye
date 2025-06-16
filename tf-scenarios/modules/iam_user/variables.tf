variable "name" {
  type = string
}

variable "inline_policies" {
  description = "Map of inline policy name to JSON-like policy document"
  type        = map(any)
  default     = {}
}

variable "managed_policy_arns" {
  description = "Map of managed policy name to its ARN"
  type        = map(string)
  default     = {}
}
