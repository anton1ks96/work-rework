FROM node:22-alpine

WORKDIR /app

COPY Work-rework/package*.json ./
RUN npm ci

COPY Work-rework/ .

RUN npm run build

RUN npm config set registry https://registry.npmmirror.com && npm install -g serve

EXPOSE 5172

CMD ["serve", "-s", "dist", "-l", "5172"]