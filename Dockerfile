# First stage: build the application
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the source from the current directory to the working directory inside the container
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 50051

# Command to run the application
CMD ["node", "dist/index.js"]

