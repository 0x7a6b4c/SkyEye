variable "users" {
  type = map(object({
    inline_policies  = map(string)
    managed_policies = list(string)
  }))
  default = {}
}

variable "groups" {
  type = map(object({
    users            = list(string)
    inline_policies  = map(string)
    managed_policies = list(string)
  }))
  default = {}
}

variable "roles" {
  type = map(object({
    assume_role_policy = string
    inline_policies    = map(string)
    managed_policies   = list(string)
  }))
  default = {}
}

variable "managed_policies" {
  type = map(object({
    description = string
    policy      = string
  }))
  default = {}
}
