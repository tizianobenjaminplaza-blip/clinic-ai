resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "rds" {
  name   = "${var.project_name}-${var.environment}-rds"
  vpc_id = aws_vpc.main.id

  ingress {
    description = "PostgreSQL from EKS nodes"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_parameter_group" "postgres16" {
  name   = "${var.project_name}-${var.environment}-pg16"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

resource "aws_db_instance" "main" {
  identifier            = "${var.project_name}-${var.environment}"
  engine                = "postgres"
  engine_version        = "16.4"
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_storage_gb
  max_allocated_storage = var.rds_storage_gb * 3
  storage_encrypted     = true

  db_name  = "clinic_ai"
  username = var.rds_username
  password = var.rds_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres16.name

  multi_az               = var.environment == "prod"
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  deletion_protection = var.environment == "prod"
  skip_final_snapshot = var.environment != "prod"

  tags = { Name = "${var.project_name}-${var.environment}-db" }
}

variable "rds_instance_class" { default = "db.t3.medium" }
variable "rds_storage_gb"     { default = 20 }
variable "rds_username"       { default = "clinic" }
variable "rds_password"       { sensitive = true }

output "rds_endpoint" { value = aws_db_instance.main.endpoint }
