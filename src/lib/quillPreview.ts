// src/lib/quillPreview.ts
const codeIntoPre = (doc: Document, preEl: HTMLElement, text: string) => {
  preEl.classList.add("hljs");
  preEl.textContent = "";

  const codeEl = doc.createElement("code");
  codeEl.className = "hljs";
  codeEl.textContent = text;

  preEl.appendChild(codeEl);
};

export function prepareHtmlForPreview(html: string): string {
  // DOMParser есть только в браузере, на сервере возвращается исходный HTML.
  if (typeof document === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // убираем служебные элементы Quill
  doc.querySelectorAll("select.ql-ui").forEach((el) => el.remove());

  // 1) Старый формат Quill: .ql-code-block-container / .ql-code-block
  doc.querySelectorAll(".ql-code-block-container").forEach((container) => {
    const blocks = Array.from(container.querySelectorAll(".ql-code-block"));
    const lines = blocks.map((b) => b.textContent || "").join("\n");
    if (!lines.trim()) return;

    const pre = doc.createElement("pre");
    codeIntoPre(doc, pre, lines);

    container.parentNode?.replaceChild(pre, container);
  });

  // 2) Новый формат Quill: <pre class="ql-syntax">...</pre> или <pre data-language="plain">...</pre>
  doc.querySelectorAll("pre.ql-syntax, pre[data-language]").forEach((preEl) => {
    const el = preEl as HTMLElement;
    if (el.classList.contains("hljs")) return;

    const text = el.textContent || "";
    if (!text.trim()) return;

    // меняем IN-PLACE
    codeIntoPre(doc, el, text);
  });

  // 3) Одиночные .ql-code-block (если вдруг встречается)
  doc.querySelectorAll(".ql-code-block").forEach((block) => {
    if (block.closest(".ql-code-block-container")) return;

    const text = block.textContent || "";
    if (!text.trim()) return;

    const pre = doc.createElement("pre");
    codeIntoPre(doc, pre, text);

    block.parentNode?.replaceChild(pre, block);
  });

  return doc.body.innerHTML;
}
