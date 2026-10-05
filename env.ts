import "dotenv/config";

export const ENV = {
  credentials: process.env.GIGACHAT_CREDENTIALS?.trim() ?? "",
  scope: process.env.GIGACHAT_SCOPE?.trim() || "GIGACHAT_API_PERS",
  modelSmart: process.env.GIGACHAT_MODEL_SMART?.trim() || "GigaChat-2-Max",
  modelCheap: process.env.GIGACHAT_MODEL_CHEAP?.trim() || "GigaChat-2",
  authUrl: process.env.GIGACHAT_AUTH_URL?.trim() ?? "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
};
