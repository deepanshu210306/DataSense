"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type MarkdownMessageProps = {
  content: string;
  className?: string;
};

// Remove a trailing horizontal rule so dividers only sit between sections.
function stripTrailingDivider(text: string): string {
  return text.replace(/\n+\s*(?:-{3,}|\*{3,}|_{3,})\s*$/, "");
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("ds-md", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return <pre>{children}</pre>;
          },
          code({ className: codeClass, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClass ?? "");
            const isBlock = Boolean(match) || String(children).includes("\n");
            if (!isBlock) {
              return (
                <code className="font-mono text-[0.84em]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre>
                <code className={cn("font-mono", codeClass)} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {stripTrailingDivider(content)}
      </ReactMarkdown>
    </div>
  );
}
