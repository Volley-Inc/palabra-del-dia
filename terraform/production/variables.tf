variable "region" {
  default = "us-east-1"
}

variable "name" {
  default = "{{project}}"
}

variable "environment" {
  default = "prod"
}

variable "oidc_issuer" {
  default = "oidc.eks.us-east-1.amazonaws.com/id/01E696BE35164FB79F396D5B1F5D6FBC"
}

variable "namespace" {
  default = "{{production-namespace}}"
}

variable "gev_service_account_name" {
  default = "{{production-helmrelease-name}}"
}

variable "glb_service_account_name" {
  default = "{{production-helmrelease-name}}-glb"
}

variable "skill_id" {
  description = "Alexa Skill ID."
  default     = "{{skillId}}"
}

variable "default_tags" {
  description = "Default Tags to apply to all resources managed by AWS provider."
  default = {
    VantaOwner            = "{{iam-username}}"
    VantaNonProd          = "false"
    VantaDescription      = "AWS resources for {{project}}"
    VantaContainsUserData = "{{contains-user-data}}"
    VantaUserDataStored   = "User emails and phone numbers"
  }
}
