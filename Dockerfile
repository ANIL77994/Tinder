# Base Image
FROM node:20-alpine

# Working Directory
WORKDIR /tinder

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose application port
EXPOSE 5000

# Start application
CMD ["npm","start"]