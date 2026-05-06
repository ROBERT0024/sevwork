# Variables de Terraform — Secure Workspace

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "secure-workspace"
}

variable "environment" {
  description = "Entorno de despliegue"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "Region de AWS"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t3.small"
}

variable "ami_id" {
  description = "AMI de Ubuntu 22.04 LTS para la region seleccionada"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS us-east-1
}

variable "key_pair_name" {
  description = "Nombre del key pair SSH para acceder a la instancia"
  type        = string
  default     = "secure-workspace-key"
}

variable "admin_cidr" {
  description = "CIDR del administrador para acceso SSH (restringir a tu IP)"
  type        = string
  default     = "0.0.0.0/0" # Cambiar a tu IP en produccion: "TU_IP/32"
}

variable "db_password" {
  description = "Contraseña de la base de datos PostgreSQL"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret_key" {
  description = "Clave secreta para firmar tokens JWT"
  type        = string
  sensitive   = true
  default     = ""
}
