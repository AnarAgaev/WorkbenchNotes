// src/demo/contracts.ts
// Контракты на границе server → client.
// Данные, которые уходят в Client Component, держим сериализуемыми (JSON-совместимыми).
// Поэтому Date не передаём — используем строку ISO.

export type HelloPayload = {
	appName: string
	renderedAt: string // as new Date().toISOString()
	mode: 'server-to-client'

	// Сервер передаёт стартовые данные.
	// Сервер и клиент согласованы типом, а не догадками.
	initialNotes: DemoNote[]
}
