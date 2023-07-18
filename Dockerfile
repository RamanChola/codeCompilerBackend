# Dockerfile
FROM ubuntu:latest

# Update and install required packages
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    build-essential \
    python3

# Copy your application code to the container
WORKDIR /usr/src/app
COPY . .

# Install Node.js dependencies
RUN npm install

# Expose the desired port (if your application listens on a specific port)
EXPOSE 5000

# Command to run your Node.js application
CMD ["node", "server.js"]
