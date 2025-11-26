# ECS Task Execution Role (pull from ECR, write logs)
resource "aws_iam_role" "ecs_task_execution_role" {
  name              = "${var.app_name}-ecs-task-execution-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.app_name}-ecs-task-execution-role-${var.environment}"
  })
}

# Attach default policy for ECR and CloudWatch Logs
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Role (for application permissions)
resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.app_name}-ecs-task-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.app_name}-ecs-task-role-${var.environment}"
  })
}

# Allow ECS task to access Secrets Manager
resource "aws_iam_role_policy" "ecs_task_secrets_policy" {
  name = "${var.app_name}-ecs-secrets-policy-${var.environment}"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:${var.app_name}/*"
      }
    ]
  })
}

# Allow ECS task to access CloudWatch Logs
resource "aws_iam_role_policy" "ecs_task_logs_policy" {
  name = "${var.app_name}-ecs-logs-policy-${var.environment}"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# GitHub Actions Role for CI/CD
resource "aws_iam_role" "github_actions" {
  name               = "${var.app_name}-github-actions-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:mhmdrazn/FP-PSO25:*"
          }
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.app_name}-github-actions-${var.environment}"
  })
}

# GitHub Actions Policy - ECR push
resource "aws_iam_role_policy" "github_actions_ecr" {
  name = "${var.app_name}-github-actions-ecr-${var.environment}"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = "arn:aws:ecr:*:*:repository/${var.app_name}-*"
      }
    ]
  })
}

# GitHub Actions Policy - Terraform
resource "aws_iam_role_policy" "github_actions_terraform" {
  name = "${var.app_name}-github-actions-terraform-${var.environment}"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:*",
          "ecs:*",
          "elasticloadbalancing:*",
          "rds:*",
          "iam:*",
          "s3:*",
          "logs:*",
          "cloudwatch:*",
          "secretsmanager:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}
