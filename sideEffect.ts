export const sideEffectCounts = { naive: 0, task: 0 };

export const notifyManager = (kind: "naive" | "task", threadId: string, what: string) => {
  sideEffectCounts[kind] += 1;
  console.log(`[${kind}] approval #${sideEffectCounts[kind]} (thread=${threadId}): ${what}`);
};
