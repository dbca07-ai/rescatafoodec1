export const money = (value: number | string) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(Number(value));

export const discount = (price: number | string, original: number | string) =>
  Math.max(0, Math.round((1 - Number(price) / Number(original)) * 100));

export const COMMISSION_RATE = 0.1;

export const CITIES = [
  "Quito",
  "Guayaquil",
  "Cuenca",
  "Ambato",
  "Manta",
  "Loja",
  "Santo Domingo",
  "Machala",
];

export const CATEGORIES = [
  "Panadería",
  "Restaurante",
  "Supermercado",
  "Cafetería",
  "Frutería",
  "Heladería",
  "Comida típica",
];