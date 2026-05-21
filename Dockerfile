FROM node:22-bookworm-slim

WORKDIR /usr/src/app
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
EXPOSE 8000
CMD ["npm", "run", "start"]
