# VPC Module
module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  app_name    = var.app_name
  vpc_cidr    = var.vpc_cidr

  tags = var.tags
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
  app_name    = var.app_name

  tags = var.tags
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  environment = var.environment
  app_name    = var.app_name

  tags = var.tags
}

# ALB Module
module "alb" {
  source = "./modules/alb"

  environment      = var.environment
  app_name         = var.app_name
  vpc_id           = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  container_port   = var.container_port
  enable_https     = var.enable_https
  acm_certificate_arn = var.acm_certificate_arn

  tags = var.tags
}

# RDS Module (optional)
module "rds" {
  count = var.enable_rds ? 1 : 0

  source = "./modules/rds"

  environment = var.environment
  app_name    = var.app_name
  vpc_id      = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  instance_class       = var.rds_instance_class
  allocated_storage    = var.rds_allocated_storage
  engine_version       = var.rds_engine_version
  master_username      = var.rds_username
  master_password      = var.rds_password

  tags = var.tags
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"

  environment = var.environment
  app_name    = var.app_name
  
  # VPC & Network
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  alb_security_group_id = module.alb.alb_security_group_id
  alb_target_group_arn = module.alb.alb_target_group_arn
  
  # ECR & Container
  ecr_repository_url = module.ecr.repository_url
  container_port    = var.container_port
  container_memory  = var.container_memory
  container_cpu     = var.container_cpu
  
  # Scaling
  desired_count    = var.desired_count
  enable_scaling   = var.enable_scaling
  min_capacity     = var.min_capacity
  max_capacity     = var.max_capacity
  
  # IAM
  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  ecs_task_role_arn          = module.iam.ecs_task_role_arn
  
  # Environment & Secrets
  container_environment = var.container_environment
  container_secrets    = var.container_secrets
  
  # Logging
  enable_cloudwatch_logging = var.enable_cloudwatch_logging
  log_retention_days       = var.log_retention_days

  tags = var.tags

  depends_on = [
    module.alb,
    module.ecr,
    module.iam
  ]
}
