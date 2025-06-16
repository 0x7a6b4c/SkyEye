variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "managed_policies" {
  description = "Custom managed policies to create"
  type = map(object({
    description = string
    policy      = any    # a JSON-like HCL map
  }))
  default = {}
}

variable "users" {
  description = "Map of users to create"
  type = map(object({
    inline_policies    = map(any)
    managed_policies   = list(string)  # list of keys from var.managed_policies or full ARNs
  }))
  default = {}
}

variable "groups" {
  description = "Map of groups to create"
  type = map(object({
    users             = list(string)
    inline_policies   = map(any)
    managed_policies  = list(string)
  }))
  default = {}
}

variable "roles" {
  description = "Map of roles to create"
  type = map(object({
    assume_users      = optional(list(string), [])
    assume_roles      = optional(list(string), [])
    inline_policies   = map(any)
    managed_policies  = list(string)
  }))
  default = {}
}