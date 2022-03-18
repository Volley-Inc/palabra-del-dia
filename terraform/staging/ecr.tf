resource "aws_ecr_repository" "gev" {
  name                 = var.name
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_lifecycle_policy" "gev" {
  repository = aws_ecr_repository.gev.name

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Keep last ${var.keep_last_images_count} v tagged images",
            "selection": {
                "tagStatus": "tagged",
                "tagPrefixList": ["v"],
                "countType": "imageCountMoreThan",
                "countNumber": ${var.keep_last_images_count}
            },
            "action": {
                "type": "expire"
            }
        },
        {
            "rulePriority": 2,
            "description": "Keep last ${var.keep_last_images_count} dev* or main* tagged images. These images are for continuous delivery.",
            "selection": {
                "tagStatus": "tagged",
                "tagPrefixList": ["dev"],
                "countType": "imageCountMoreThan",
                "countNumber": ${var.keep_last_images_count}
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}
