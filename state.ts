import { StateSchema, MessagesValue } from "@langchain/langgraph";
import * as z from "zod";

export const State = new StateSchema({
  messages: MessagesValue,
  intent: z.enum(["faq", "trip"]).default("faq"),
});

export type StateT = typeof State.State;
