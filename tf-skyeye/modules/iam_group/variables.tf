variable "name" {
  type = string
}

variable "users" {
  description = "List of user names to put in this group"
  type        = list(string)
  default     = []
}

variable "inline_policies" {
  description = "Map of inline policy name to JSON-like document"
  type        = map(any)
  default     = {}
}

variable "managed_policies" {
  description = "Map of managed policy name to its ARN"
  type        = map(string)
  default     = {}
}
