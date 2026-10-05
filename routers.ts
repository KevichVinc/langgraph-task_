import { AIMessage } from "@langchain/core/messages";
import { END } from "@langchain/langgraph";
import { RISKY_TOOLS } from "./tools";
import type { StateT } from "./state";

export const afterClassify = (state: StateT): "faq" | "agent" =>
  state.intent === "faq" ? "faq" : "agent";

export const afterAgent = (state: StateT): "approve" | "tools" | typeof END => {
  const calls = (state.messages.at(-1) as AIMessage | undefined)?.tool_calls ?? [];
  if (calls.length === 0) return END;
  return calls.some((call) => RISKY_TOOLS.has(call.name)) ? "approve" : "tools";
};
