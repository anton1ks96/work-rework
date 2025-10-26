# work-rework

React-приложение для работы с GitHub API, позволяющее просматривать репозитории, файлы, коммиты и скачивать содержимое в ZIP-архивах.

## Запуск проекта через Docker Compose (рекомендуется)

### Быстрый старт

1. Убедитесь, что у вас установлены [Docker](https://www.docker.com/get-started) и Docker Compose

2. Клонируйте репозиторий:
```bash
git clone <url-репозитория>
cd work-rework
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Заполните переменные окружения в файле `.env`:
```env
# URL для LDAP аутентификации
LDAP_URL=ldap://your-ldap-server:389

# URL вашего GitBucket сервера
GITBUCKET_URL=http://your-gitbucket-server

# API ключ для доступа к GitBucket
GITBUCKET_API_KEY=your-api-key

# URL для веб-интерфейса (обычно http://localhost:5172)
WORK_URL=http://localhost:5172
```

5. Запустите проект:
```bash
docker-compose up -d
```

6. Откройте браузер и перейдите по адресу: http://localhost:5172

### Управление приложением

Остановить все контейнеры:
```bash
docker-compose down
```

Остановить без удаления контейнеров:
```bash
docker-compose stop
```

Запустить остановленные контейнеры:
```bash
docker-compose start
```

Посмотреть логи:
```bash
# Все сервисы
docker-compose logs -f

# Только веб-интерфейс
docker-compose logs -f web

# Только backend сервис
docker-compose logs -f work-svc
```

Пересобрать и перезапустить:
```bash
docker-compose up -d --force-recreate
```

Обновить образы:
```bash
docker-compose pull
docker-compose up -d
```

### Структура проекта

Проект состоит из двух сервисов:

- **work-svc** (backend, порт 8070) - API сервис с функционалом:
  - LDAP аутентификация
  - Интеграция с GitBucket
  - REST API для работы с данными
  - Health check endpoint: `http://localhost:8070/api/ping`

- **web** (frontend, порт 5172) - React веб-интерфейс

### Volumes

- `./photos` - директория для хранения фотографий (монтируется в work-svc контейнер)

## Запуск отдельных Docker-контейнеров

Если вы хотите запустить только веб-интерфейс:

```bash
docker run -d \
  -p 5172:5172 \
  --name work-web \
  airsss/work-web:latest
```

Для запуска backend сервиса:

```bash
docker run -d \
  -p 8070:8070 \
  -e LDAP_URL=ldap://your-ldap-server:389 \
  -e GITBUCKET_URL=http://your-gitbucket-server \
  -e GITBUCKET_API_KEY=your-api-key \
  -e WORK_URL=http://localhost:5172 \
  -v ./photos:/app/photos \
  --name work-svc \
  airsss/work-svc:latest
```

## Локальная разработка

### Требования
- Node.js 22 или выше
- npm

### Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <url-репозитория>
cd work-rework/Work-rework
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env`:
```bash
echo "VITE_API_BASE_URL=http://localhost:8070" > .env
```

4. Запустите проект в режиме разработки:
```bash
npm run dev
```

5. Откройте http://localhost:5173 в браузере

### Сборка для продакшена

```bash
npm run build
npm run preview
```

## Сборка Docker-образа локально

Если вы хотите собрать Docker-образ веб-интерфейса самостоятельно:

```bash
# Из корневой директории проекта
docker build -t work-web:local \
  --build-arg VITE_API_BASE_URL=http://localhost:8070 \
  .

# Запуск собранного образа
docker run -d -p 5172:5172 --name work-web work-web:local
```

## Функциональность

- Просмотр публичных репозиториев GitHub/GitBucket
- Навигация по файлам и директориям репозитория
- Просмотр истории коммитов
- Скачивание репозиториев и папок в формате ZIP
- LDAP аутентификация
- Адаптивный дизайн с поддержкой светлой и тёмной темы

## Технологии

### Frontend
- React 18
- Vite
- GitHub API

### Backend
- Node.js
- LDAP интеграция
- GitBucket API

### DevOps
- Docker
- Docker Compose

## Troubleshooting

### Контейнеры не запускаются

Проверьте логи:
```bash
docker-compose logs
```

### Проблемы с подключением к backend

1. Убедитесь, что work-svc контейнер запущен:
```bash
docker-compose ps
```

2. Проверьте health check:
```bash
curl http://localhost:8070/api/ping
```

### Ошибки LDAP аутентификации

Проверьте правильность `LDAP_URL` в файле `.env`

### Проблемы с GitBucket API

Убедитесь, что:
- `GITBUCKET_URL` указан корректно
- `GITBUCKET_API_KEY` действителен и имеет необходимые права

## Лицензия

MIT