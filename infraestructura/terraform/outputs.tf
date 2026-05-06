# Outputs de Terraform — Secure Workspace

output "app_public_ip" {
  description = "IP publica del servidor de la aplicacion"
  value       = aws_instance.app.public_ip
}

output "app_url" {
  description = "URL de acceso al frontend"
  value       = "http://${aws_instance.app.public_ip}"
}

output "api_url" {
  description = "URL del API Gateway"
  value       = "http://${aws_instance.app.public_ip}:8000"
}

output "api_docs_url" {
  description = "URL de la documentacion Swagger de la API"
  value       = "http://${aws_instance.app.public_ip}:8000/docs"
}

output "vpc_id" {
  description = "ID de la VPC creada"
  value       = aws_vpc.main.id
}

output "ssh_command" {
  description = "Comando SSH para conectarse al servidor"
  value       = "ssh -i ${var.key_pair_name}.pem ubuntu@${aws_instance.app.public_ip}"
}
