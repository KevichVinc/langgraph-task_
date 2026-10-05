# LangGraph: согласование командировки

Учебный граф на TypeScript с GigaChat.

В проекте есть:

- `StateGraph`
- conditional edges
- `ToolNode`
- 3 инструмента
- `interrupt`
- `Command({ resume })`
- `MemorySaver`
- GigaChat

## Запуск

```bash
npm install
cp .env.example .env
npm run typecheck
npm run dev
```

В `.env` нужно указать `GIGACHAT_CREDENTIALS`.

Для проверки сценария можно использовать запрос:

`Проверь командировку TRIP-13, оцени расходы и забронируй её.`

Граф должен сначала проверить данные поездки, затем при попытке `create_booking` остановиться на `interrupt` и запросить подтверждение.
