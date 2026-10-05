import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { State } from "./state";
import { agent, approve, classify, faq } from "./nodes";
import { afterAgent, afterClassify } from "./routers";
import { tools } from "./tools";

export const buildWorkflow = () =>
  new StateGraph(State)
    .addNode("classify", classify)
    .addNode("faq", faq)
    .addNode("agent", agent)
    .addNode("approve", approve, { ends: ["tools", "agent"] })
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "classify")
    .addConditionalEdges("classify", afterClassify, { faq: "faq", agent: "agent" })
    .addConditionalEdges("agent", afterAgent, { approve: "approve", tools: "tools", [END]: END })
    .addEdge("tools", "agent")
    .addEdge("faq", END);
