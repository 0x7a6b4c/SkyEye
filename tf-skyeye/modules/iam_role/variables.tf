variable "name" {
  type = string
}

variable "assume_role_policy" {
  description = "Full JSON assume-role policy"
  type        = string
}

variable "inline_policies" {
  description = "Map of inline policy name to JSON-like document"
  type        = map(any)
  default     = {}
}

variable "managed_policies" {
  description = "Map of policy name to ARN"
  type        = map(string)
  default     = {}
}