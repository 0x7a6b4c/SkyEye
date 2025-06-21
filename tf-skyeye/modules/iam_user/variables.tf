variable "name" {
  description = "The name of the IAM user"
  type        = string
}

variable "inline_policies" {
  description = "Map of inline policy names → JSON policy documents"
  type        = map(string)
  default     = {}
}

variable "managed_policies" {
  description = "Map of IAM managed policy ARNs to attach"
  type        = map(string)
  default     = {}
}

variable "create_access_key" {
  description = "Whether to create an access key for this user"
  type        = bool
  default     = false
}
