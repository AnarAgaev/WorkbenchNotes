// src/@types/window.d.ts
export {}

declare global {
	interface Window {
		// Quill Syntax модуль ждёт именно hljs-объект (default export)
		hljs?: (typeof import('highlight.js'))['default']
	}
}
