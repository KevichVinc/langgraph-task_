export interface Trip {
  id: string;
  employee: string;
  destination: string;
  days: number;
  budget: number;
  status: "draft" | "approved" | "booked";
  bookingAllowed: boolean;
  booked: boolean;
}

const SEED: Trip[] = [
  {
    id: "TRIP-13",
    employee: "Алексей",
    destination: "Казань",
    days: 3,
    budget: 45000,
    status: "approved",
    bookingAllowed: true,
    booked: false,
  },
  {
    id: "TRIP-7",
    employee: "Мария",
    destination: "Сочи",
    days: 5,
    budget: 70000,
    status: "draft",
    bookingAllowed: false,
    booked: false,
  },
  {
    id: "TRIP-42",
    employee: "Иван",
    destination: "Екатеринбург",
    days: 2,
    budget: 30000,
    status: "approved",
    bookingAllowed: true,
    booked: false,
  },
];

let trips: Trip[] = SEED.map((trip) => ({ ...trip }));

export const getTrip = (id: string) =>
  trips.find((trip) => trip.id.toUpperCase() === id.toUpperCase());

export const bookTrip = (id: string) => {
  const trip = getTrip(id);
  if (!trip) return { ok: false, message: `Командировка ${id} не найдена` };
  if (!trip.bookingAllowed) return { ok: false, message: `Командировка ${id} пока не согласована` };
  if (trip.booked) return { ok: false, message: `Командировка ${id} уже забронирована` };

  trip.booked = true;
  trip.status = "booked";
  return {
    ok: true,
    message: `Бронирование для ${id} создано: ${trip.destination}, ${trip.days} дн.`,
  };
};

export const resetTrips = () => {
  trips = SEED.map((trip) => ({ ...trip }));
};
