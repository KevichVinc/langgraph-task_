import { MemorySaver } from "@langchain/langgraph";
import { buildWorkflow } from "./graph";

const checkpointer = new MemorySaver();

export const graph = buildWorkflow().compile({ checkpointer });
