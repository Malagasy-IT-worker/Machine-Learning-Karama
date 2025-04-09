resource "aws_key_pair" "my_key" {
  key_name   = "key"
  public_key = file("${path.module}/../../Key/key.pub")
}

resource "aws_instance" "ec2_demo" {
  ami             = var.ami
  instance_type   = var.instance_type

  security_groups = var.security_groups
  key_name        = aws_key_pair.my_key.key_name

  
  tags = {
    Name = var.instance_name
  }
  #user_data = file("${path.module}/cloud-init.yaml")

}

resource "aws_eip" "my_eip" {
  instance = aws_instance.ec2_demo.id
}
resource "null_resource" "force_provision" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = <<EOT
      echo "[${aws_instance.ec2_demo.tags.Name}]" > "${path.root}/Environments/Hand-on/ansible/hosts.ini"
      echo "${aws_instance.ec2_demo.public_ip} ansible_user=admin ansible_ssh_private_key_file=${path.root}/Key/key" >> "${path.root}/Environments/Hand-on/ansible/hosts.ini"
      ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook \
        -i '${path.root}/Environments/Hand-on/ansible/hosts.ini' \
        '${path.root}/Environments/Hand-on/ansible/ansible_playbook.yaml'
    EOT
  }
}

