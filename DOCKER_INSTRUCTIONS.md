# Complete Guide: Running the Tinder Application in Docker from Scratch on Windows

This guide covers everything you need to know to get Docker installed, configured, and running securely with your local Node.js/Express and MongoDB Atlas application on Windows.

---

## 1. Prerequisites (Installing Docker on Windows)

Before running the application in a container, you need Docker installed on your Windows machine:

1. **Enable Virtualization**:
   - Open **Task Manager** (`Ctrl + Shift + Esc`), go to the **Performance** tab, and ensure **Virtualization** is listed as **Enabled**.
   - If disabled, you must enable it in your computer's BIOS/UEFI settings.

2. **Install WSL 2 (Windows Subsystem for Linux)**:
   - Open PowerShell as Administrator and run:
     ```powershell
     wsl --install
     ```
   - Restart your computer if prompted.

3. **Install Docker Desktop**:
   - Download the installer from the [Docker Desktop Website](https://www.docker.com/products/docker-desktop/).
   - Run the installer and ensure **Use WSL 2 instead of Hyper-V (recommended)** is checked.
   - Start Docker Desktop and accept the service agreement.

---

## 2. Understanding the Project's Docker Files

To run this application, three core files are already configured in your workspace:

### A. `.dockerignore`
Prevents local files like `node_modules` and sensitive secrets (`.env`) from being copied into the container image during the build process:
```text
node_modules
.env
.git
.gitignore
npm-debug.log
```

### B. `Dockerfile`
Defines how to build the container image:
```dockerfile
FROM node:20-alpine
WORKDIR /tinder
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### C. `docker-compose.yml`
Defines the container configuration, runtime variables (`env_file`), and the DNS settings to ensure MongoDB Atlas resolves correctly:
```yaml
services:
  tinder:
    build: .
    container_name: tinder
    ports:
      - "3000:3000"
    dns:
      - 8.8.8.8
      - 1.1.1.1
    env_file:
      - .env
```

---

## 3. Running the Application Step-by-Step

### Step 1: Create your `.env` file
Make sure you have a `.env` file in the root directory containing your MongoDB URI (already set up in your folder):
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0...
```

### Step 2: Run using Docker Compose (Recommended)
Open your terminal (PowerShell, CMD, or Git Bash) in your project root directory `c:\Users\User\Desktop\Tinder` and run:

```bash
# Build and run the container in the foreground
docker compose up --build
```
You should see output indicating that the server is running and the database is connected:
```text
tinder  | Server running on port 3000
tinder  | connect the DB
```

#### Other useful Compose commands:
- **Run in Background**:
  ```bash
  docker compose up -d
  ```
- **Check Logs (when running in background)**:
  ```bash
  docker compose logs -f
  ```
- **Stop and Remove Containers**:
  ```bash
  docker compose down
  ```

---

## 4. Alternative: Running with Docker CLI (Without Compose)

If you want to run the container using raw Docker commands:

1. **Build the Docker Image**:
   ```bash
   docker build -t tinder-app .
   ```
2. **Run the Container**:
   You must pass the environment file and set the DNS servers manually in the run command:
   ```bash
   docker run --env-file .env --dns 8.8.8.8 -p 3000:3000 --name tinder-container tinder-app
   ```
3. **Stop the Container**:
   ```bash
   docker stop tinder-container
   docker rm tinder-container
   ```

---

## 5. Security & Network Details

- **Secure Environment**: Since `.env` is listed in `.dockerignore`, your secrets are never baked into the Docker image itself. This means you can safely push your Docker image to registries like Docker Hub or GitHub Packages without leaking database credentials.
- **DNS (8.8.8.8 & 1.1.1.1)**: Docker Desktop on Windows uses a local loopback DNS. This is unable to resolve SRV records for cloud databases like MongoDB Atlas. Specifying custom DNS servers bypasses the internal loopback proxy and resolves database domains correctly.
