# IAM for GLB
module "glb_irsa" {
  source       = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version      = "4.2.0"
  create_role  = true
  role_name    = "${var.name}-${var.environment}-glb"
  provider_url = var.oidc_issuer
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:${var.namespace}:${var.glb_service_account_name}"
  ]
}

resource "aws_iam_role_policy" "glb_irsa" {
  name   = "${var.name}-${var.environment}-glb"
  policy = data.aws_iam_policy_document.glb_irsa.json
  role   = module.glb_irsa.iam_role_name
}

data "aws_iam_policy_document" "glb_irsa" {
  statement {
    effect = "Allow"
    resources = [
      "arn:aws:dynamodb:*:*:table/${var.name}-${var.environment}-glb"
    ]
    actions = [
      "dynamodb:*"
    ]
  }
}

# IAM for GEV
module "gev_irsa" {
  source       = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version      = "4.2.0"
  create_role  = true
  role_name    = "${var.name}-${var.environment}-gev"
  provider_url = var.oidc_issuer
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:${var.namespace}:${var.gev_service_account_name}"
  ]
}

resource "aws_iam_role_policy" "gev_irsa" {
  name   = "${var.name}-${var.environment}-gev"
  policy = data.aws_iam_policy_document.gev_irsa.json
  role   = module.gev_irsa.iam_role_name
}

data "aws_iam_policy_document" "gev_irsa" {
  statement {
    effect = "Allow"
    resources = [
      "arn:aws:dynamodb:*:*:table/${var.name}-users-${var.environment}"
    ]
    actions = [
      "dynamodb:*"
    ]
  }

  statement {
    effect    = "Allow"
    resources = ["arn:aws:ssm:*:*:parameter/${var.name}/${var.environment}/*"]
    actions = [
      "ssm:GetParameter"
    ]
  }

  # Remove this once Vox is ready on k8s
  statement {
    effect    = "Allow"
    resources = ["arn:aws:lambda:*:*:function:vox-${var.environment}-api"]
    actions = [
      "lambda:InvokeFunction",
      "lambda:InvokeAsync"
    ]
  }
}
