aws_region = "ap-southeast-1"
environment = "dev"
enable_rds = false
rds_password = "dummy-not-used"

container_environment = {
  NEXTAUTH_URL = "http://localhost:3000"
}

container_secrets = {
  NEXTAUTH_SECRET    = "arn:aws:secretsmanager:ap-southeast-1:113221193811:secret:nextauth-secret-Xpc7a7"
  SUPABASE_URL       = "arn:aws:secretsmanager:ap-southeast-1:113221193811:secret:supabase-url-Xpc7a7"
  SUPABASE_ANON_KEY  = "arn:aws:secretsmanager:ap-southeast-1:113221193811:secret:supabase-anon-key-Xpc7a7"
  DATABASE_URL       = "arn:aws:secretsmanager:ap-southeast-1:113221193811:secret:database-url-Xpc7a7"
  BLOB_READ_WRITE_TOKEN = "arn:aws:secretsmanager:ap-southeast-1:113221193811:secret:blob-token-Xpc7a7"
  OPENAI_API_KEY     = "arn:aws:secretsmanager:ap-southeast-1:113221193811:secret:openai-key-Xpc7a7"
}
