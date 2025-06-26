variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "managed_policies" {
  description = "Map of custom IAM policies to create"
  type = map(object({
    description = string
    policy      = any    # a Terraform expression for the policy document
  }))
  default = {}
}

variable "users" {
  description = "Map of IAM users to create"
  type = map(object({
    inline_policies   = optional(map(any), {})      # policy-docs
    managed_policies  = optional(list(string), [])  # names, either AWS-managed or custom
    groups            = optional(list(string), [])  # group names to attach
    create_access_key = optional(bool, false)       # whether to generate an access key for testing
  }))
  default = {}
}

variable "groups" {
  description = "Map of IAM groups to create"
  type = map(object({
    users            = optional(list(string), [])  # user names to put in the group
    inline_policies  = optional(map(any), {})      # policy-docs
    managed_policies = optional(list(string), [])  # names, either AWS-managed or custom
  }))
  default = {}
}

variable "roles" {
  description = "Map of IAM roles to create"
  type = map(object({
    assume_users    = optional(list(string), [])  # which users can assume
    assume_roles    = optional(list(string), [])  # which roles can assume
    inline_policies = optional(map(any), {})      # policy-docs
    managed_policies = optional(list(string), []) # names, AWS-managed or custom
  }))
  default = {}
}