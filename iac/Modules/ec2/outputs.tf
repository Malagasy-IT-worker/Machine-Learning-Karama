output "public_ip" {
  description = "Adresse IP publique de l'instance EC2"
  value       = aws_instance.ec2_demo.public_ip
}
