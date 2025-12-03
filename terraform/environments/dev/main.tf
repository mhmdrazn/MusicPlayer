# Development Environment Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment dan configure untuk production use
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "music-player/dev/terraform.tfstate"
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

  environment       = "dev"
  aws_region        = var.aws_region
  app_name          = "music-player"
  container_port    = 3000
  container_memory  = 512
  container_cpu     = 256
  desired_count     = 1
  enable_scaling    = false
  min_capacity      = 1
  max_capacity      = 1
  vpc_cidr          = "10.0.0.0/16"

  # RDS Configuration (set enable_rds = true if you want a dedicated database)
  enable_rds     = false
  # rds_instance_class      = "db.t3.micro"
  # rds_allocated_storage   = 20
  # rds_engine_version      = "15.4"
  # rds_username            = var.rds_username
  # rds_password            = var.rds_password

  # HTTPS Configuration (set enable_https = true if you have an ACM certificate)
  enable_https = false
  # acm_certificate_arn = var.acm_certificate_arn

  # Container Environment Variables
  container_environment = {
    NODE_ENV = "development"
  }

  # Logging
  enable_cloudwatch_logging = true
  log_retention_days        = 3

  tags = {
    Environment = "development"
    CostCenter  = "dev-team"
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

# Output
output "alb_dns_name" {
  value = module.music_player.alb_dns_name
}

output "ecr_repository_url" {
  value = module.music_player.ecr_repository_url
}
