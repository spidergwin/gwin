import React from "react";

interface MarkdownRendererProps {
  content: string;
}

/** Render inline markdown: **bold**, `code`, [links](url) */
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Simple regex-based inline parser
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(
        <strong key={key++} className="font-bold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground text-xs"
        >
          {match[3]}
        </code>
      );
    } else if (match[4] && match[5]) {
      // Link
      parts.push(
        <a
          key={key++}
          href={match[5]}
          className="text-foreground underline underline-offset-4 hover:opacity-75 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let inTable = false;
  let tableRows: string[][] = [];
  let idx = 0;

  for (const line of lines) {
    idx++;

    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} className="my-6 rounded-xl overflow-hidden border border-border/60">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/40">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                {codeLang || "code"}
              </span>
            </div>
            <pre className="overflow-x-auto p-4 bg-[#18181b] dark:bg-[#0c0c0e] text-[#e4e4e7] text-xs leading-relaxed">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table detection
    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim() !== "")
        .map((c) => c.trim());

      // Skip separator rows
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;

      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      // Flush table
      elements.push(
        <div key={`table-${idx}`} className="my-6 overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/60">
                {tableRows[0]?.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-bold text-foreground border-b border-border/50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-border/30 last:border-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // Headings
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${idx}`}
          className="text-2xl font-bold text-foreground mt-12 mb-4 tracking-tight border-b border-border/20 pb-2"
        >
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${idx}`}
          className="text-lg font-bold text-foreground mt-8 mb-3"
        >
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // List items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li
          key={`li-${idx}`}
          className="text-sm text-muted-foreground leading-relaxed ml-6 list-disc mb-1"
        >
          {renderInlineMarkdown(line.slice(2))}
        </li>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+/);
    if (numMatch) {
      elements.push(
        <li
          key={`ol-${idx}`}
          className="text-sm text-muted-foreground leading-relaxed ml-6 list-decimal mb-1"
        >
          {renderInlineMarkdown(line.slice(numMatch[0].length))}
        </li>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p key={`p-${idx}`} className="text-sm text-muted-foreground leading-loose mb-5">
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  // Flush pending table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="table-end" className="my-6 overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/60">
              {tableRows[0]?.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-bold text-foreground border-b border-border/50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-border/30 last:border-0">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2 text-muted-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <>{elements}</>;
}
