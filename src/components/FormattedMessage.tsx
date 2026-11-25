import React from 'react';

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

/**
 * FormattedMessage parses markdown bold (**text**), bullet points (•, -, *),
 * numbered lists (1., 2.), and paragraph breaks, rendering them cleanly without
 * displaying raw markdown syntax symbols like ** in the UI.
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({
  content,
  isUser = false,
}) => {
  if (!content) return null;

  // Helper to parse inline formatting: **bold**, *italic*, `code`
  const renderInlineFormattedText = (text: string): React.ReactNode[] => {
    // Regex matches **bold**, *italic*, or `code`
    const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

    return tokens.map((token, index) => {
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        const inner = token.slice(2, -2);
        return (
          <strong
            key={index}
            className={isUser ? 'font-bold text-white' : 'font-semibold text-slate-900'}
          >
            {inner}
          </strong>
        );
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
        const inner = token.slice(1, -1);
        return (
          <em key={index} className="italic">
            {inner}
          </em>
        );
      }
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        const inner = token.slice(1, -1);
        return (
          <code
            key={index}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
              isUser
                ? 'bg-slate-800 text-cyan-200'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {inner}
          </code>
        );
      }
      return <React.Fragment key={index}>{token}</React.Fragment>;
    });
  };

  // Split into paragraph blocks
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className={`space-y-2.5 text-xs leading-relaxed ${isUser ? 'text-white' : 'text-slate-700'}`}>
      {blocks.map((block, bIdx) => {
        const lines = block.split('\n').filter((l) => l.trim().length > 0);

        // Check if block is a list
        const isBulletList = lines.every((line) => /^(\s*[-•*]\s+)/.test(line));
        const isNumberedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-1.5 my-1.5 pl-1">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^\s*[-•*]\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        isUser ? 'bg-cyan-300' : 'bg-[#635BFF]'
                      }`}
                    />
                    <span className="flex-1">{renderInlineFormattedText(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-1.5 my-1.5 pl-1">
              {lines.map((line, lIdx) => {
                const match = line.match(/^\s*(\d+)\.\s+(.*)/);
                const num = match ? match[1] : `${lIdx + 1}`;
                const text = match ? match[2] : line;
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span
                      className={`text-[11px] font-bold shrink-0 mt-0.5 ${
                        isUser ? 'text-cyan-300' : 'text-[#635BFF]'
                      }`}
                    >
                      {num}.
                    </span>
                    <span className="flex-1">{renderInlineFormattedText(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular paragraph (may have single linebreaks inside)
        return (
          <p key={bIdx} className="font-normal">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineFormattedText(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
