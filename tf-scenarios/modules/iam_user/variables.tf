variable "name" {
  type = string
}

variable "inline_policies" {
  type = map(any)
  default = {}
}

variable "managed_policies" {
  type = list(string)
  default = []
}
