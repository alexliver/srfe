
# Use the official Node.js image as the base image
FROM node:22-alpine AS builder
# Set the working directory
WORKDIR /app
RUN npm install -g serve
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

ENV REACT_APP_SR_URL=http://18.217.93.143:8080

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["serve", "-s", "build"]

