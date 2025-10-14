FROM node:22-alpine

WORKDIR /app

COPY Work-rework/package*.json ./

RUN npm ci

COPY Work-rework/ .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

RUN npm install -g serve

EXPOSE 5172

CMD ["serve", "-s", "dist", "-l", "5172"]