variable "region" {
  default = "us-east-1"
}

variable "name" {
  default = "{{project}}"
}

variable "keep_last_images_count" {
  type        = number
  description = "Keep recent images and expire rest through ECR lifecycle policy."
  default     = 10
}

variable "environment" {
  default = "staging"
}

variable "oidc_issuer" {
  default = "oidc.eks.us-east-1.amazonaws.com/id/01E696BE35164FB79F396D5B1F5D6FBC"
}

variable "namespace" {
  default = "{{staging-namespace}}"
}

variable "gev_service_account_name" {
  default = "{{staging-helmrelease-name}}"
}

variable "glb_service_account_name" {
  default = "{{staging-helmrelease-name}}-glb"
}

variable "default_tags" {
  description = "Default Tags to apply to all resources managed by AWS provider."
  default = {
    VantaOwner            = "{{iam-username}}"
    VantaNonProd          = "true"
    VantaDescription      = "AWS resources for {{project}}"
    VantaContainsUserData = "{{contains-user-data}}"
    VantaUserDataStored   = "User emails and phone numbers"
  }
}
