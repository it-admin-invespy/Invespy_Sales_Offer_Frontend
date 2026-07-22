FROM node:20-alpine

# Install PM2 globally to manage the Node process in the container
RUN npm install -g pm2

WORKDIR /app

# Accept NEXT_PUBLIC_BASE_URL as a build argument so CI/CD can inject
# the correct value per environment (staging vs production)
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .

# Build the Next.js application with the baked-in NEXT_PUBLIC_* vars
RUN npm run build

EXPOSE 3000
CMD ["pm2-runtime", "npm", "--", "start"]
