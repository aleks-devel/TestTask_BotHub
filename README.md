# Тестовое задание

Всё запускается в докер, структура базы данных выставляется автоматически на первом запуске

## Development запуск:

node будет на 3000 порту и pgadmin на 5050

Node запускается через nodemon и реагирует на все изменения

```shell
docker compose -f docker-compose.dev.yml up -d
```

## Production запуск:

node будет на 80 порту и pgadmin на 5050

```shell
docker compose -f docker-compose.dev.yml up -d
```

## Апи:

GET /api/models - получение списка всех моделей с их метаданными.


POST /api/models - добавление новой модели в базу данных с заданными метаданными.


GET /api/models/:id - получение подробной информации о конкретной модели.


PUT /api/models/:id - обновление метаданных конкретной модели.


DELETE /api/models/:id - удаление модели из базы данных.


Раз в день (в 1 час ночи) отправляет запрос к https://openrouter.ai/api/v1/models Для теста запроса расскоментировать строки 21-25 в файле [src/providers/cron-api.provider.ts](src%.providers%2Fcron-api.provider.ts)