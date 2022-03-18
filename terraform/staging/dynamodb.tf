# DynamoDB table for GLB
resource "aws_dynamodb_table" "glb" {
  name     = "${var.name}-${var.environment}-glb"
  hash_key = "routingId"
  attribute {
    name = "routingId"
    type = "S"
  }
  billing_mode = "PAY_PER_REQUEST"
  ttl {
    attribute_name = "ttl"
    enabled        = "true"
  }
}

# DynamoDB table for GEV
resource "aws_dynamodb_table" "users" {
  name     = "${var.name}-users-${var.environment}"
  hash_key = "userId"
  attribute {
    name = "userId"
    type = "S"
  }
  billing_mode = "PAY_PER_REQUEST"
  point_in_time_recovery {
    enabled = false
  }
}
