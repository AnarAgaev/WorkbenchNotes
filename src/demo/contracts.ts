// src/demo/contracts.ts
// Контракты на границе server → client.
// Данные, которые уходят в Client Component, держим сериализуемыми (JSON-совместимыми).
// Поэтому Date не передаём — используем строку ISO.

export type HelloPayload = {
	appName: string
	renderedAt: string // ISO-строка вместо Date: безопасно проходит через границу
	mode: 'server-to-client' // литеральный маркер: фиксирует допустимое значение поля
}
