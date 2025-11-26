variable "environment" {
  type = string
}

variable "app_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "alb_target_group_arn" {
  type = string
}

variable "ecr_repository_url" {
  type = string
}

variable "container_port" {
  type = number
}

variable "container_memory" {
  type = number
}

variable "container_cpu" {
  type = number
}

variable "desired_count" {
  type = number
}

variable "enable_scaling" {
  type = bool
}

variable "min_capacity" {
  type = number
}

variable "max_capacity" {
  type = number
}

variable "ecs_task_execution_role_arn" {
  type = string
}

variable "ecs_task_role_arn" {
  type = string
}

variable "container_environment" {
  type    = map(string)
  default = {}
}

variable "container_secrets" {
  type    = map(string)
  default = {}
}

variable "enable_cloudwatch_logging" {
  type = bool
}

variable "log_retention_days" {
  type = number
}

variable "tags" {
  type    = map(string)
  default = {}
}
