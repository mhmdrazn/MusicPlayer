#!/usr/bin/env pwsh
Set-Location d:\Code\MusicPlayer\terraform
Write-Host "Planning Terraform changes..."
terraform plan -var-file=environments/dev/terraform.tfvars -out=tfplan

Write-Host "`nApplying Terraform changes..."
terraform apply -auto-approve tfplan

Write-Host "`nOIDC provider created successfully!"
