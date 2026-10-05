import { Agent } from "node:https";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GigaChat } from "langchain-gigachat";
// zod/v3 — по той же причине, что в tools.ts: withStructuredOutput у GigaChat
// конвертит схему через zod-to-json-schema (zod 3 only)
import { z } from "zod/v3";
import { ENV } from "./env";

const makeGigaChat = (model: string) =>
  new GigaChat({
    credentials: ENV.credentials,
    scope: ENV.scope,
    authUrl: ENV.authUrl,
    model,
    httpsAgent: new Agent({ rejectUnauthorized: false })
  });

export const smart = makeGigaChat(ENV.modelSmart);
export const cheap = makeGigaChat(ENV.modelCheap);

const IntentSchema = z.object({
  intent: z
    .enum(["faq", "order"])
    .describe("faq — общий вопрос о правилах сервиса; order — вопрос о конкретном заказе, статусе или возврате"),
});

/** Классификация intent'а дешёвой моделью; решение потом читает роутер из стейта */
export const classifyIntent = async (messages: BaseMessage[]): Promise<"faq" | "order"> => {
  try {
    // явный generic — иначе tsc тонет в выводе типов из zod/v3-схемы (TS2589)
    const structured = cheap.withStructuredOutput<{ intent: "faq" | "order" }>(IntentSchema, {
      name: "classify_intent",
    });
    const { intent } = await structured.invoke([
      new SystemMessage(
        "Классифицируй запрос клиента интернет-магазина. " +
          "faq — общий вопрос о правилах; order — про конкретный заказ, его статус или возврат денег.",
      ),
      ...messages,
    ]);
    return intent;
  } catch {
    // фолбэк: просим ответить одним словом (structured output у провайдера мог не завестись)
    const res = await cheap.invoke([
      new SystemMessage('Ответь ровно одним словом: "faq" или "order".'),
      ...messages,
    ]);
    return /order/i.test(String(res.content)) ? "order" : "faq";
  }
};
