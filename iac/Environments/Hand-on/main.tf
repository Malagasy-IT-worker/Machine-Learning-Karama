module "vpc" {
  source = "../../Modules/vpc"
}

module "ec2" {
  source            = "../../Modules/ec2"
  ami               = "ami-0779caf41f9ba54f0"
  instance_type     = "t2.micro"
  instance_name     = "ec2-demo"
  security_groups   = ["allow-ports",]
}
