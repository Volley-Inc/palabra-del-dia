output "gev_ecr_repository_url" {
  value = aws_ecr_repository.gev.repository_url
}

output "gev_iam_role_arn" {
  value = module.gev_irsa.iam_role_arn
}

output "glb_iam_role_arn" {
  value = module.glb_irsa.iam_role_arn
}

output "users_table_arn" {
  value = aws_dynamodb_table.users.arn
}

output "glb_table_arn" {
  value = aws_dynamodb_table.glb.arn
}
