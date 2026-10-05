import { tool } from "@langchain/core/tools";
import { z } from "zod/v3";
import { bookTrip, getTrip } from "./orders";

export const lookupTrip = tool(
  async ({ tripId }: { tripId: string }) => {
    const trip = getTrip(tripId);
    if (!trip) return JSON.stringify({ error: `Командировка ${tripId} не найдена` });
    return JSON.stringify(trip);
  },
  {
    name: "lookup_trip",
    description: "Получить данные о командировке по ID, включая город, бюджет и статус согласования.",
    schema: z.object({
      tripId: z.string().describe("ID командировки, например TRIP-13"),
    }),
  },
);

export const estimateTripCost = tool(
  async ({ tripId }: { tripId: string }) => {
    const trip = getTrip(tripId);
    if (!trip) return JSON.stringify({ error: `Командировка ${tripId} не найдена` });

    const transport = Math.round(trip.budget * 0.45);
    const hotel = Math.round(trip.budget * 0.4);
    const daily = trip.budget - transport - hotel;

    return JSON.stringify({
      tripId: trip.id,
      transport,
      hotel,
      daily,
      total: trip.budget,
    });
  },
  {
    name: "estimate_trip_cost",
    description: "Разложить бюджет командировки на транспорт, отель и суточные.",
    schema: z.object({
      tripId: z.string().describe("ID командировки, например TRIP-13"),
    }),
  },
);

export const createBooking = tool(
  async ({ tripId }: { tripId: string }) => JSON.stringify(bookTrip(tripId)),
  {
    name: "create_booking",
    description: "Создать бронирование согласованной командировки. Вызывать только после проверки командировки.",
    schema: z.object({
      tripId: z.string().describe("ID командировки, например TRIP-13"),
    }),
  },
);

export const tools = [lookupTrip, estimateTripCost, createBooking];

export const RISKY_TOOLS = new Set(["create_booking"]);
