// src/demo/contracts.ts
// Контракты на границе server → client.
// Данные, которые уходят в Client Component, держим сериализуемыми (JSON-совместимыми).

export type HelloPayload = {
  appName: string;
  renderedAt: string;
  mode: "server-to-client";

  // Сервер передаёт стартовые данные.
  // Сервер и клиент согласованы типом, а не догадками.
  initialNotes: DemoNote[];
};
