# AWS ECR & EC2 Continuous Deployment (CD) Setup Guide

This guide provides end-to-end instructions for deploying your Tinder Node.js backend using **Amazon ECR** (Elastic Container Registry) and **Amazon EC2** (Elastic Compute Cloud) with the automated GitHub Actions CD pipeline in `.github/workflows/cd.yml`.

---

## 1. Overview of the CD Architecture

When code is pushed to the `main` branch (or when triggered manually):
1. **GitHub Actions** builds the Docker image from your [Dockerfile](file:///c:/Users/User/Desktop/Tinder/Dockerfile).
2. The image is tagged and pushed to your private **Amazon ECR** repository with both git commit SHA and `latest`.
3. GitHub Actions securely connects to your **AWS EC2** instance via SSH.
4. On the EC2 instance, Docker authenticates with ECR, pulls the new image, stops the previous container, and starts the new container with live environment variables on port `3000`.

---

## 2. AWS Setup Steps

### Step 1: Create an Amazon ECR Repository
1. Open the [AWS Management Console](https://console.aws.amazon.com/) and navigate to **Amazon ECR**.
2. Click **Create repository**.
3. Under **Visibility settings**, choose **Private**.
4. Set the **Repository name** (e.g., `dev-tinder` or `tinder-backend`).
5. Leave other default settings and click **Create repository**.
6. Note down your **Repository name** and **URI** (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/dev-tinder`).

---

### Step 2: Create an IAM User for GitHub Actions
1. Navigate to **AWS IAM** &rarr; **Users** &rarr; **Create user**.
2. Name the user: `github-actions-tinder-deployer`.
3. Under **Permissions**, attach the policy:
   - `AmazonEC2ContainerRegistryPowerUser` (Allows push/pull to ECR).
4. Finish creating the user, go to the user's **Security credentials** tab.
5. Click **Create access key** &rarr; select **Application running outside AWS** &rarr; click **Next** &rarr; **Create access key**.
6. Save the **Access Key ID** and **Secret Access Key**.

---

### Step 3: Launch and Configure an AWS EC2 Instance
1. Navigate to **EC2** &rarr; **Instances** &rarr; **Launch an instance**.
2. **Name**: `tinder-backend-server`.
3. **OS**: **Ubuntu Server 24.04 LTS** (or 22.04 LTS) or **Amazon Linux 2023**.
4. **Instance Type**: `t2.micro` (Free Tier eligible) or `t3.small`.
5. **Key Pair**: Select an existing key pair or create a new `.pem` key pair (e.g. `tinder-key.pem`). **Download and save this file securely**.
6. **Network Settings (Security Group)**:
   - Ensure an inbound rule for **SSH (Port 22)** from `Anywhere` (0.0.0.0/0) or your specific IP.
   - Add a custom TCP rule for **Port 3000** (Custom TCP, Port: `3000`, Source: `0.0.0.0/0`) so your backend APIs can receive traffic.
   - (Optional) HTTP (Port 80) and HTTPS (Port 443) if using Nginx reverse proxy.
7. Click **Launch Instance**.

---

### Step 4: Initial One-Time Setup on your EC2 Instance

Connect to your EC2 instance via SSH:
```bash
ssh -i /path/to/tinder-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Once connected, run this one-time setup script to install **Docker** and the **AWS CLI**, and allow running Docker without `sudo`:

```bash
# Update system packages
sudo apt-get update -y && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io unzip curl

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user (ubuntu) to the docker group
sudo usermod -aG docker $USER

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip ./aws

# Verify installations
docker --version
aws --version

# Log out and log back in for group changes to take effect:
exit
```

Log back in:
```bash
ssh -i /path/to/tinder-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```
Test Docker without sudo:
```bash
docker ps
```
If this runs without permission errors, your EC2 instance is completely ready for automated deployments!

---

## 3. Configure GitHub Repository Secrets

In your GitHub repository:
1. Go to **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
2. Click **New repository secret** for each of the following:

| Secret Name | Description / Example Value |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Your IAM user access key (e.g., `AKIA...`) |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret access key |
| `AWS_REGION` | Your AWS Region code (e.g., `us-east-1` or `ap-south-1`) |
| `ECR_REPOSITORY` | Your ECR repository name (e.g., `dev-tinder`) |
| `EC2_HOST` | Public IP or Public DNS of your EC2 instance (e.g., `54.210.12.34`) |
| `EC2_USER` | EC2 default user (`ubuntu` for Ubuntu, or `ec2-user` for Amazon Linux) |
| `EC2_SSH_KEY` | Full contents of your `.pem` private key file (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) |
| `MONGO_URI` | Your MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster0...`) |
| `SECRATEKEY` | Your JWT secret key for signing user authentication tokens |

---

## 4. Triggering the Deployment

### Automatic Trigger:
Push any commit to the `main` branch:
```bash
git checkout main
git merge <feature-branch>
git push origin main
```

### Manual Trigger:
1. In your GitHub repository, navigate to the **Actions** tab.
2. Click on **Tinder CD** in the left sidebar.
3. Click **Run workflow** &rarr; choose `main` branch &rarr; click **Run workflow**.

---

## 5. Monitoring & Useful EC2 Commands

Once deployed, you can verify your application directly on EC2:

- **Check running container**:
  ```bash
  docker ps
  ```
- **View live application logs**:
  ```bash
  docker logs -f tinder
  ```
- **Test health locally on EC2**:
  ```bash
  curl http://localhost:3000/feed
  ```
- **Restart application container**:
  ```bash
  docker restart tinder
  ```
