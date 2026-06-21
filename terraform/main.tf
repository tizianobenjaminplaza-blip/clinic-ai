terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
  # Remote state in S3 + DynamoDB locking.
  # Create the bucket/table before first `terraform init`.
  backend "s3" {
    bucket         = "clinic-ai-tfstate"
    key            = "infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "clinic-ai-tflock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "clinic-ai"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

variable "aws_region"   { default = "us-east-1" }
variable "environment"  { default = "dev" }
variable "project_name" { default = "clinic-ai" }
