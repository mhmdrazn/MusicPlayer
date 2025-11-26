output "db_instance_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_username" {
  description = "Database master username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "db_instance_port" {
  description = "Database port"
  value       = aws_db_instance.main.port
}

output "db_instance_arn" {
  description = "Database ARN"
  value       = aws_db_instance.main.arn
}
