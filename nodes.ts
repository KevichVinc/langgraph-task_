import { AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { Command, interrupt, task } from "@langchain/langgraph";
import { z } from "zod/v3";
import { cheap, smart } from "./models";
import { notifyManager } from "./sideEffect";
import { RISKY_TOOLS, tools } from "./tools";
import type { StateT } from "./state";

export interface ApprovePayload {
  question: string;
  calls: { id?: string; name: string; args: Record<string, unknown> }[];
}

export interface ApproveDecision {
  approved: boolean;
  comment?: string;
}

const IntentSchema = z.object({
  intent: z.enum(["faq", "trip"]),
});

const classifyIntent = async (state: StateT): Promise<"faq" | "trip"> => {
  try {
    const structured = cheap.withStructuredOutput<{ intent: "faq" | "trip" }>(IntentSchema, {
      name: "classify_trip_intent",
    });

    const result = await structured.invoke([
      new SystemMessage(
        "Классифицируй запрос. faq — общий вопрос о правилах командировок; trip — вопрос о конкретной командировке, бюджете или бронировании.",
      ),
      ...state.messages,
    ]);

    return result.intent;
  } catch {
    const result = await cheap.invoke([
      new SystemMessage('Ответь ровно одним словом: "faq" или "trip".'),
      ...state.messages,
    ]);
    return /trip/i.test(String(result.content)) ? "trip" : "faq";
  }
};

export const classify = async (state: StateT) => ({
  intent: await classifyIntent(state),
});

export const faq = async (state: StateT) => ({
  messages: [
    await smart.invoke([
      new SystemMessage(
        "Ты помощник по корпоративным командировкам. Кратко отвечай на общие вопросы о согласовании, бюджете и бронировании. Не выдумывай данные конкретных поездок.",
      ),
      ...state.messages,
    ]),
  ],
});

export const agent = async (state: StateT) => ({
  messages: [
    await smart.bindTools(tools).invoke([
      new SystemMessage(
        "Ты помощник по корпоративным командировкам. Для конкретной поездки используй инструменты. Перед create_booking сначала проверь командировку через lookup_trip. Отвечай по-русски и кратко.",
      ),
      ...state.messages,
    ]),
  ],
});

const notifyManagerOnce = task("notify_manager", async (threadId: string, what: string) => {
  notifyManager("task", threadId, what);
  return { notifiedAt: new Date().toISOString() };
});

export const approve = async (state: StateT, config: LangGraphRunnableConfig) => {
  const last = state.messages.at(-1) as AIMessage;
  const risky = (last.tool_calls ?? []).filter((call) => RISKY_TOOLS.has(call.name));
  const threadId = String(config.configurable?.thread_id ?? "?");
  const what = risky.map((call) => `${call.name}(${JSON.stringify(call.args)})`).join(", ");

  notifyManager("naive", threadId, what);
  await notifyManagerOnce(threadId, what);

  const decision = interrupt<ApprovePayload, ApproveDecision>({
    question: "Подтвердить бронирование командировки?",
    calls: risky.map((call) => ({ id: call.id, name: call.name, args: call.args })),
  });

  if (decision.approved) return new Command({ goto: "tools" });

  return new Command({
    goto: "agent",
    update: {
      messages: risky.map(
        (call) =>
          new ToolMessage({
            tool_call_id: call.id!,
            content: `Операция отклонена. Причина: ${decision.comment ?? "не указана"}. Бронирование создавать нельзя.`,
          }),
      ),
    },
  });
};
