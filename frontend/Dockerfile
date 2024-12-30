# Use a specific Node.js version instead of latest for consistency
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Run the development server
CMD ["npm", "run", "dev"]
