module "s3" {
  source = "./Modules/s3"
}

module "dynamo" {
  source = "./Modules/dynamo"
}

module "hand-on" {
  source = "./Environments/Hand-on/"
}