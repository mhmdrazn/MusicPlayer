terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure when you have S3 bucket for remote state
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "music-player/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "MusicPlayer"
      ManagedBy   = "Terraform"
    }
  }
}
