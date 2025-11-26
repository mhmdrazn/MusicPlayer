# Production Environment Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # IMPORTANT: Configure S3 backend for state management in production
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "music-player/prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region
}

module "music_player" {
  source = "../"

  environment       = "prod"
  aws_region        = var.aws_region
  app_name          = "music-player"
  container_port    = 3000
  container_memory  = 1024
  container_cpu     = 512
  desired_count     = 2
  enable_scaling    = true
  min_capacity      = 2
  max_capacity      = 4
  vpc_cidr          = "10.0.0.0/16"

  # RDS Configuration (recommended for production)
  enable_rds          = true
  rds_instance_class  = "db.t3.small"
  rds_allocated_storage = 100
  rds_engine_version  = "15.4"
  rds_username        = var.rds_username
  rds_password        = var.rds_password

  # HTTPS Configuration (recommended for production)
  enable_https        = true
  acm_certificate_arn = var.acm_certificate_arn

  # Container Environment Variables
  container_environment = {
    NODE_ENV = "production"
  }

  # Logging
  enable_cloudwatch_logging = true
  log_retention_days        = 30

  tags = {
    Environment = "production"
    CostCenter  = "operations"
  }
}

variable "aws_region" {
  type = string
}

variable "rds_username" {
  type      = string
  sensitive = true
}

variable "rds_password" {
  type      = string
  sensitive = true
}

variable "acm_certificate_arn" {
  type = string
}

# Output
output "alb_dns_name" {
  value = module.music_player.alb_dns_name
}

output "ecr_repository_url" {
  value = module.music_player.ecr_repository_url
}

output "rds_endpoint" {
  value = module.music_player.rds_endpoint
}
