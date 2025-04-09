output "ec2_public_ip" {
  description = "Adresse IP publique de l'instance EC2"
  value       = module.ec2.public_ip
}
