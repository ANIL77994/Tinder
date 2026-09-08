# Base Image
FROM node:20-alpine

# Working Directory
WORKDIR /tinder

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose application port
EXPOSE 3000

# Start application
CMD ["npm","start"]