
# Use the official Node.js image as the base image
FROM node:22-alpine AS builder
RUN npm config set proxy null
RUN npm config set https-proxy null
RUN npm config set registry http://registry.npmjs.org/
# sh
RUN npm install -g pnpm
# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN pnpm i

# Copy the rest of the application code to the working directory
COPY . .

ENV NEXT_PUBLIC_SR_URL=http://18.217.93.143:8080

# Build the Next.js application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]
