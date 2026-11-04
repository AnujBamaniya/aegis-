import React from "react";

/**
 * Whitelist markdown parser for LLM executive briefing text.
 * Strictly renders:
 * - paragraphs (<p>)
 * - h2 (## ) and h3 (### ) headings
 * - **bold** inline
 * - bullet lists (- or *) (<ul><li>...</li></ul>)
 * - numbered lists (1. ) (<ol><li>...</li></ol>)
 *
 * No innerHTML, no links, no images, no raw HTML.
 */
export function MarkdownBrief({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let keyCounter = 0;

  const parseInline = (str: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let currentText = "";
    let bold = false;
    let i = 0;

    while (i < str.length) {
      if (str[i] === "*" && str[i + 1] === "*") {
        if (currentText) {
          result.push(
            <React.Fragment key={keyCounter++}>
              {bold ? (
                <strong className="font-medium text-white">{currentText}</strong>
              ) : (
                <span>{currentText}</span>
              )}
            </React.Fragment>,
          );
          currentText = "";
        }
        bold = !bold;
        i += 2;
      } else {
        currentText += str[i];
        i += 1;
      }
    }

    if (currentText) {
      result.push(
        <React.Fragment key={keyCounter++}>
          {bold ? (
            <strong className="font-medium text-white">{currentText}</strong>
          ) : (
            <span>{currentText}</span>
          )}
        </React.Fragment>,
      );
    }

    return result.length ? result : [<span key={keyCounter++}>{str}</span>];
  };

  let listItems: string[] = [];
  let currentListType: "bullet" | "number" | null = null;

  const flushList = () => {
    if (listItems.length === 0 || !currentListType) return;
    const isOrdered = currentListType === "number";
    const Tag = isOrdered ? "ol" : "ul";
    const listClass = isOrdered
      ? "mb-4 list-decimal list-outside pl-5 text-white/70 space-y-1"
      : "mb-4 list-disc list-outside pl-5 text-white/70 space-y-1";

    nodes.push(
      <Tag key={keyCounter++} className={listClass}>
        {listItems.map((item, idx) => (
          <li key={idx} className="font-light leading-relaxed">
            {parseInline(item)}
          </li>
        ))}
      </Tag>,
    );
    listItems = [];
    currentListType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed === "") {
      flushList();
      continue;
    }

    // Heading 3: ### Heading
    if (trimmed.startsWith("### ")) {
      flushList();
      const headingContent = trimmed.slice(4).trim();
      nodes.push(
        <h3
          key={keyCounter++}
          className="mt-4 mb-2 font-bricolage text-base font-medium tracking-tight text-white/90"
        >
          {parseInline(headingContent)}
        </h3>,
      );
      continue;
    }

    // Heading 2: ## Heading
    if (trimmed.startsWith("## ")) {
      flushList();
      const headingContent = trimmed.slice(3).trim();
      nodes.push(
        <h2
          key={keyCounter++}
          className="mt-5 mb-2 font-bricolage text-lg font-medium tracking-tight text-white"
        >
          {parseInline(headingContent)}
        </h2>,
      );
      continue;
    }

    // Bullet list: - or *
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (currentListType === "number") {
        flushList();
      }
      currentListType = "bullet";
      const itemContent = trimmed.slice(2).trim();
      listItems.push(itemContent);
      continue;
    }

    // Numbered list: 1. or 2. etc.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (currentListType === "bullet") {
        flushList();
      }
      currentListType = "number";
      listItems.push(numberedMatch[2].trim());
      continue;
    }

    // Plain paragraph
    flushList();
    nodes.push(
      <p key={keyCounter++} className="mb-4 font-light leading-relaxed text-white/70">
        {parseInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return <div className="space-y-1">{nodes}</div>;
}
