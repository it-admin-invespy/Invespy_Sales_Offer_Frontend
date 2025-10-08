FROM node:20

ENV DEBIAN_FRONTEND=noninteractive

# This value matches your local environment configuration.
ENV NEXT_PUBLIC_BASE_URL="https://dev.salesoffer.invespy-smartlink.io"

# Install PM2 globally to manage the Node process in the container
RUN npm install -g pm2

# Set the working directory inside the container
WORKDIR /app

# Copy the application code
COPY . .

# Install dependencies 
RUN npm install

# Build the Next.js application
RUN npm run build

# --- Runtime Configuration ---
# This ensures Next.js server-side code finds the variable if it relies on a physical .env file.
RUN echo "NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}" > .env

# Expose the default Next.js port
EXPOSE 3000

# Use PM2 to start the application and keep it running reliably
CMD ["pm2-runtime", "npm", "--", "run", "start"]

