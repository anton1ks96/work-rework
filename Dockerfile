FROM node:22-alpine

WORKDIR /app

COPY Work-rework/package*.json ./
RUN npm ci

COPY Work-rework/ .

ARG API_BASE_URL
ENV API_BASE_URL=${API_BASE_URL}

RUN npm run build

RUN npm install -g serve

EXPOSE 5172

CMD ["serve", "-s", "dist", "-l", "5172"]