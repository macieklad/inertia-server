import { useState, useCallback } from "react";
import { cn } from "../lib/utils";

interface CodeTab {
  label: string;
  code: string;
  language: "typescript" | "tsx";
}

interface CodeBlockProps {
  tabs: CodeTab[];
}

function highlightCode(code: string, _language: "typescript" | "tsx"): string {
  const patterns: [RegExp, string][] = [
    [/(\/\/.*$)/gm, '<span class="code-comment">$1</span>'],
    [/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>'],
    [/("(?:[^"\\]|\\.)*")/g, '<span class="code-string">$1</span>'],
    [/('(?:[^'\\]|\\.)*')/g, '<span class="code-string">$1</span>'],
    [/(`(?:[^`\\]|\\.)*`)/g, '<span class="code-string">$1</span>'],
    [
      /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|new|this|async|await|try|catch|throw|typeof|instanceof|in|of|default|as|namespace|declare|global)\b/g,
      '<span class="code-keyword">$1</span>',
    ],
    [
      /\b(string|number|boolean|void|null|undefined|any|never|unknown|object|Array|Promise|Date|Record)\b/g,
      '<span class="code-type">$1</span>',
    ],
    [/(&lt;\/?)([A-Z][a-zA-Z0-9]*)/g, '$1<span class="code-component">$2</span>'],
    [/(&lt;\/?)([a-z][a-zA-Z0-9]*)/g, '$1<span class="code-tag">$2</span>'],
    [/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="code-function">$1</span>'],
    [/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '.<span class="code-property">$1</span>'],
    [/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-number">$1</span>'],
    [/(=>|===|!==|==|!=|<=|>=|&&|\|\||\.\.\.)/g, '<span class="code-operator">$1</span>'],
  ];

  let result = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  for (const [pattern, replacement] of patterns) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

export function CodeBlock({ tabs }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    const code = tabs[activeTab]?.code;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [activeTab, tabs]);

  const currentTab = tabs[activeTab];
  if (!currentTab) return null;

  return (
    <div className="mt-8 overflow-hidden rounded-sm border border-border bg-[oklch(12%_0_0)] dark:bg-[oklch(8%_0_0)]">
      <div className="flex items-center justify-between border-b border-[oklch(20%_0_0)] bg-[oklch(14%_0_0)] dark:border-[oklch(16%_0_0)] dark:bg-[oklch(10%_0_0)]">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-4 py-2 text-xs font-medium transition-colors",
                activeTab === index
                  ? "border-b-2 border-brand text-brand"
                  : "text-[oklch(55%_0_0)] hover:text-[oklch(70%_0_0)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={copyToClipboard}
          className="mr-2 flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs text-[oklch(55%_0_0)] transition-colors hover:bg-[oklch(20%_0_0)] hover:text-[oklch(80%_0_0)]"
        >
          {copied ? (
            <>
              <CheckIcon />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto p-4">
        <pre className="text-[13px] leading-relaxed">
          <code
            dangerouslySetInnerHTML={{
              __html: highlightCode(currentTab.code, currentTab.language),
            }}
          />
        </pre>
      </div>

      <style>{`
        .code-keyword { color: oklch(70% 0.15 300); }
        .code-string { color: oklch(70% 0.12 145); }
        .code-comment { color: oklch(50% 0 0); font-style: italic; }
        .code-number { color: oklch(75% 0.12 60); }
        .code-function { color: oklch(75% 0.15 230); }
        .code-type { color: oklch(75% 0.12 180); }
        .code-component { color: oklch(75% 0.15 45); }
        .code-tag { color: oklch(70% 0.12 20); }
        .code-property { color: oklch(80% 0.08 90); }
        .code-operator { color: oklch(70% 0.1 200); }
      `}</style>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
