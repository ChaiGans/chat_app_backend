# chat_app_backend

This repository is made to make the backend for a chatting website using socket mechanism which allows user to chat live.

How migrate:

- Fill the requirement database url, make sure already create a db using postgre. In .env, DATABASE_URL
- npx prisma generate
- npx prisma migrate dev --name init