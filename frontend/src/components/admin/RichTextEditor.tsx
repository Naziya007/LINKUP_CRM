'use client';

import React, { useState, useRef } from 'react';
import {
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineCode,
  HiOutlineLink,
  HiOutlinePhotograph,
  HiOutlineTable,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineClipboardList
} from 'react-icons/hi';

interface RichTextEditorProps {
  value: string | string[];
  onChange: (value: string) => void;
  label?: string;
  rows?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  label = 'Article Content (Markdown / HTML)',
  rows = 10
}: RichTextEditorProps) {
  // Convert array or string content to normalized string
  const getNormalizedString = (val: string | string[]) => {
    if (Array.isArray(val)) {
      return val.join('\n\n');
    }
    return val || '';
  };

  const textContent = getNormalizedString(value);
  const [mode, setMode] = useState<'editor' | 'split' | 'preview'>('editor');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [fontSize, setFontSize] = useState<string>('16');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate cursor line & col
  const handleSelectionChange = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const lines = text.substring(0, selStart).split('\n');
    setCursorPos({
      line: lines.length,
      col: (lines[lines.length - 1] || '').length + 1
    });
  };

  // Helper to wrap selected text or insert text at cursor position
  const wrapOrInsert = (startTag: string, endTag: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || defaultText;

    const newText =
      currentText.substring(0, start) +
      startTag +
      selectedText +
      endTag +
      currentText.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + startTag.length + selectedText.length;
      textarea.setSelectionRange(
        start + startTag.length,
        newCursorPos
      );
    }, 10);
  };

  // Line-level prefix helper (for headers, lists, quotes)
  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const lineStart = currentText.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = currentText.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = currentText.length;

    const selectedLines = currentText.substring(lineStart, lineEnd).split('\n');
    const modifiedLines = selectedLines.map((line) => {
      if (line.startsWith(prefix)) {
        return line.substring(prefix.length);
      }
      return `${prefix}${line}`;
    });

    const newText =
      currentText.substring(0, lineStart) +
      modifiedLines.join('\n') +
      currentText.substring(lineEnd);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + modifiedLines.join('\n').length);
    }, 10);
  };

  // Formatting actions
  const handleBold = () => wrapOrInsert('**', '**', 'bold text');
  const handleItalic = () => wrapOrInsert('*', '*', 'italic text');
  const handleUnderline = () => wrapOrInsert('<u>', '</u>', 'underlined text');
  const handleStrikethrough = () => wrapOrInsert('~~', '~~', 'strikethrough text');
  const handleSubscript = () => wrapOrInsert('<sub>', '</sub>', 'subscript');
  const handleSuperscript = () => wrapOrInsert('<sup>', '</sup>', 'superscript');
  const handleInlineCode = () => wrapOrInsert('`', '`', 'code snippet');

  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    wrapOrInsert(`<div align="${align}">\n`, '\n</div>', 'Aligned content');
  };

  const handleFontFamily = (font: string) => {
    setFontFamily(font);
    if (font !== 'Default') {
      wrapOrInsert(`<span style="font-family: ${font};">`, '</span>', 'styled font text');
    }
  };

  const handleFontSize = (size: string) => {
    setFontSize(size);
    if (size.startsWith('h')) {
      const level = size === 'h1' ? '# ' : size === 'h2' ? '## ' : '### ';
      applyLinePrefix(level);
    } else {
      wrapOrInsert(`<span style="font-size: ${size}px;">`, '</span>', `${size}px text`);
    }
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    wrapOrInsert(`<span style="color: ${color};">`, '</span>', 'colored text');
  };

  const handleLink = () => {
    const url = prompt('Enter URL link:', 'https://');
    if (!url) return;
    const title = prompt('Enter link text:', 'Link text') || 'Link text';
    wrapOrInsert(`[${title}](`, `${url})`);
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (!url) return;
    const alt = prompt('Enter image alt text / caption:', 'Image caption') || 'Image';
    wrapOrInsert(`![${alt}](`, `${url})`);
  };

  const handleTable = () => {
    const tableTemplate = `\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n`;
    wrapOrInsert(tableTemplate);
  };

  const handleClearFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end);
    if (!selectedText) return;

    const cleanText = selectedText
      .replace(/<[^>]*>/g, '')
      .replace(/[\*_~#`]/g, '');

    const newText = currentText.substring(0, start) + cleanText + currentText.substring(end);
    onChange(newText);
  };

  const insertSampleTemplate = () => {
    const template = `# Article Headline

It was a dark and stormy night...

## Introduction
Writing compelling digital content requires a solid structure and clear formatting.

* High clarity and readability
* Interactive user engagement
* Optimized SEO performance

### Key Takeaways
> "Great web experiences combine high performance with clean design."

| Feature | Support | Status |
| --- | --- | --- |
| Rich Text | Yes | Active |
| Markdown | Yes | Enabled |
| HTML Tags | Supported | Ready |
`;
    onChange(template);
  };

  // Word & character counts
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  // Render HTML / Markdown preview parser helper
  const renderPreviewContent = (text: string) => {
    if (!text.trim()) {
      return <div className="text-slate-400 italic py-6 text-center text-sm sm:text-base">No content to preview. Type something in the editor!</div>;
    }

    const items = text.split(/\n\n+/);
    const blocks: { type: 'h1' | 'h2' | 'h3' | 'list' | 'quote' | 'table' | 'p'; items: string[] }[] = [];

    items.forEach((item) => {
      const trimmed = item.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('### ')) {
        blocks.push({ type: 'h3', items: [trimmed.replace(/^###\s+/, '')] });
      } else if (trimmed.startsWith('## ')) {
        blocks.push({ type: 'h2', items: [trimmed.replace(/^##\s+/, '')] });
      } else if (trimmed.startsWith('# ')) {
        blocks.push({ type: 'h1', items: [trimmed.replace(/^#\s+/, '')] });
      } else if (trimmed.startsWith('> ')) {
        blocks.push({ type: 'quote', items: [trimmed.replace(/^>\s+/, '')] });
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const bulletLines = trimmed.split('\n').map((l) => l.replace(/^[\*\-]\s+/, '').trim()).filter(Boolean);
        blocks.push({ type: 'list', items: bulletLines });
      } else if (trimmed.includes('|')) {
        blocks.push({ type: 'table', items: [trimmed] });
      } else {
        blocks.push({ type: 'p', items: [trimmed] });
      }
    });

    return (
      <div className="space-y-4 text-slate-900 text-sm sm:text-base leading-relaxed font-normal p-3 sm:p-5 bg-white rounded-xl border border-slate-200">
        {blocks.map((block, idx) => {
          if (block.type === 'h1') {
            return <h1 key={idx} className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 mb-2">{block.items[0]}</h1>;
          }
          if (block.type === 'h2') {
            return <h2 key={idx} className="text-xl sm:text-2xl font-black text-cyan-900 border-b border-slate-200 pb-1.5 mt-4 mb-2">{block.items[0]}</h2>;
          }
          if (block.type === 'h3') {
            return <h3 key={idx} className="text-lg sm:text-xl font-extrabold text-slate-800 mt-3 mb-1.5">{block.items[0]}</h3>;
          }
          if (block.type === 'quote') {
            return (
              <blockquote key={idx} className="border-l-4 border-cyan-600 pl-3 py-1.5 italic text-slate-700 bg-cyan-50/50 rounded-r-lg my-2 font-medium text-sm sm:text-base">
                {block.items[0]}
              </blockquote>
            );
          }
          if (block.type === 'list') {
            return (
              <ul key={idx} className="list-disc list-inside space-y-1 pl-2 font-semibold text-slate-800 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 my-2 text-sm sm:text-base">
                {block.items.map((bullet, i) => (
                  <li key={i}>{bullet.replace(/\*\*(.*?)\*\*/g, '$1')}</li>
                ))}
              </ul>
            );
          }
          if (block.type === 'table') {
            const lines = block.items[0].split('\n').filter(Boolean);
            const rows = lines.filter((l) => !l.includes('---'));
            return (
              <div key={idx} className="overflow-x-auto my-3 border border-slate-200 rounded-xl max-w-full">
                <table className="w-full text-left text-xs sm:text-sm min-w-[280px]">
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
                      return (
                        <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 font-bold border-b border-slate-200' : 'border-b border-slate-100'}>
                          {cols.map((col, cIdx) => (
                            <td key={cIdx} className="p-2 sm:p-3">{col}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
          const formatted = block.items[0].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <p key={idx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-2 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-sm sm:text-base font-bold text-slate-800">{label}</label>

        {/* Editor View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setMode('editor')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              mode === 'editor' ? 'bg-white text-cyan-800 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HiOutlinePencil className="w-3.5 h-3.5 text-cyan-600" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              mode === 'split' ? 'bg-white text-cyan-800 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HiOutlineCode className="w-3.5 h-3.5 text-cyan-600" />
            <span>Split View</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              mode === 'preview' ? 'bg-white text-cyan-800 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HiOutlineEye className="w-3.5 h-3.5 text-cyan-600" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Main Container (Classic Window Styling) */}
      <div className="border-2 border-slate-300 rounded-2xl overflow-hidden bg-slate-100 shadow-xs w-full max-w-full">
        {/* Top Menu Bar */}
        <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs font-bold text-slate-700 flex-wrap gap-2">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="font-extrabold text-cyan-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0" />
              Text Editor
            </span>
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                className="hover:text-cyan-800 hover:bg-slate-300 px-2 py-0.5 rounded cursor-pointer"
              >
                File
              </button>
              {activeMenu === 'file' && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-30 w-44 py-1">
                  <button
                    type="button"
                    onClick={() => { onChange(''); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-between"
                  >
                    <span>Clear All</span>
                    <HiOutlineTrash className="w-4 h-4 text-red-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { insertSampleTemplate(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-between"
                  >
                    <span>Insert Sample</span>
                    <HiOutlineDocumentText className="w-4 h-4 text-cyan-600" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                className="hover:text-cyan-800 hover:bg-slate-300 px-2 py-0.5 rounded cursor-pointer"
              >
                Edit
              </button>
              {activeMenu === 'edit' && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-30 w-44 py-1">
                  <button
                    type="button"
                    onClick={() => { handleClearFormatting(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 text-xs font-medium"
                  >
                    Clear Formatting
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (textareaRef.current) textareaRef.current.select();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 text-xs font-medium"
                  >
                    Select All
                  </button>
                </div>
              )}
            </div>

            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'insert' ? null : 'insert')}
                className="hover:text-cyan-800 hover:bg-slate-300 px-2 py-0.5 rounded cursor-pointer"
              >
                Insert
              </button>
              {activeMenu === 'insert' && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-30 w-44 py-1">
                  <button
                    type="button"
                    onClick={() => { handleLink(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 text-xs font-medium"
                  >
                    Hyperlink
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleImage(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 text-xs font-medium"
                  >
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleTable(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 text-xs font-medium"
                  >
                    Table
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-slate-500 font-mono text-[10px] sm:text-[11px] hidden sm:block">
            Rich HTML / Markdown Editor
          </div>
        </div>

        {/* Primary Formatting Toolbar */}
        {mode !== 'preview' && (
          <div className="bg-slate-50 border-b border-slate-300 p-1.5 sm:p-2 space-y-1.5 sm:space-y-2 overflow-x-auto max-w-full">
            {/* Toolbar Row 1: Actions, Lists, Alignment */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-slate-700 min-w-max sm:min-w-0">
              <button
                type="button"
                onClick={handleClearFormatting}
                title="Clear formatting"
                className="p-1 sm:p-1.5 rounded hover:bg-slate-200 hover:text-cyan-800 border border-transparent hover:border-slate-300 text-slate-700 cursor-pointer text-xs"
              >
                🧹
              </button>

              <div className="w-px h-4 sm:h-5 bg-slate-300 mx-0.5 sm:mx-1" />

              <button
                type="button"
                onClick={handleLink}
                title="Insert Hyperlink"
                className="p-1 sm:p-1.5 rounded hover:bg-slate-200 hover:text-cyan-800 border border-transparent hover:border-slate-300 text-slate-700 cursor-pointer"
              >
                <HiOutlineLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleImage}
                title="Insert Image"
                className="p-1 sm:p-1.5 rounded hover:bg-slate-200 hover:text-cyan-800 border border-transparent hover:border-slate-300 text-slate-700 cursor-pointer"
              >
                <HiOutlinePhotograph className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleTable}
                title="Insert Table"
                className="p-1 sm:p-1.5 rounded hover:bg-slate-200 hover:text-cyan-800 border border-transparent hover:border-slate-300 text-slate-700 cursor-pointer"
              >
                <HiOutlineTable className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="w-px h-4 sm:h-5 bg-slate-300 mx-0.5 sm:mx-1" />

              <button
                type="button"
                onClick={() => applyLinePrefix('* ')}
                title="Bulleted List"
                className="p-1 sm:p-1.5 rounded hover:bg-slate-200 hover:text-cyan-800 font-bold border border-transparent hover:border-slate-300 text-slate-700 cursor-pointer"
              >
                <HiOutlineClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyLinePrefix('1. ')}
                title="Numbered List"
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-slate-200 hover:text-cyan-800 font-extrabold text-[11px] sm:text-xs border border-transparent hover:border-slate-300 text-slate-700 cursor-pointer"
              >
                1.≡
              </button>

              <div className="w-px h-4 sm:h-5 bg-slate-300 mx-0.5 sm:mx-1" />

              <button
                type="button"
                onClick={() => handleAlign('left')}
                title="Align Left"
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-slate-200 hover:text-cyan-800 font-extrabold text-[11px] sm:text-xs border border-transparent hover:border-slate-300 cursor-pointer"
              >
                ⇐ Left
              </button>
              <button
                type="button"
                onClick={() => handleAlign('center')}
                title="Align Center"
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-slate-200 hover:text-cyan-800 font-extrabold text-[11px] sm:text-xs border border-transparent hover:border-slate-300 cursor-pointer"
              >
                ≡ Center
              </button>
              <button
                type="button"
                onClick={() => handleAlign('right')}
                title="Align Right"
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-slate-200 hover:text-cyan-800 font-extrabold text-[11px] sm:text-xs border border-transparent hover:border-slate-300 cursor-pointer"
              >
                Right ⇒
              </button>
            </div>

            {/* Toolbar Row 2: Font Family, Size, Color, Bold, Italic, Underline, etc. */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 border-t border-slate-200 min-w-max sm:min-w-0">
              <select
                value={fontFamily}
                onChange={(e) => handleFontFamily(e.target.value)}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-600 cursor-pointer max-w-[110px] sm:max-w-none"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Impact">Impact</option>
                <option value="Monospace">Monospace</option>
              </select>

              <select
                value={fontSize}
                onChange={(e) => handleFontSize(e.target.value)}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-600 cursor-pointer"
              >
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px (Normal)</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
                <option value="24">24px</option>
                <option value="h1">Heading 1 (#)</option>
                <option value="h2">Heading 2 (##)</option>
                <option value="h3">Heading 3 (###)</option>
              </select>

              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1 py-0.5">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-0 cursor-pointer bg-transparent"
                  title="Pick Text Color"
                />
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-600 font-bold uppercase">{textColor}</span>
              </div>

              <div className="w-px h-4 sm:h-5 bg-slate-300 mx-0.5 sm:mx-1" />

              <button
                type="button"
                onClick={handleBold}
                title="Bold (**text**)"
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 font-black text-xs sm:text-sm bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-900 cursor-pointer shadow-2xs"
              >
                B
              </button>
              <button
                type="button"
                onClick={handleItalic}
                title="Italic (*text*)"
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 italic font-serif font-black text-xs sm:text-sm bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-900 cursor-pointer shadow-2xs"
              >
                I
              </button>
              <button
                type="button"
                onClick={handleUnderline}
                title="Underline (<u>text</u>)"
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 underline font-black text-xs sm:text-sm bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-900 cursor-pointer shadow-2xs"
              >
                U
              </button>
              <button
                type="button"
                onClick={handleStrikethrough}
                title="Strikethrough (~~text~~)"
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 line-through font-bold text-xs sm:text-sm bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-900 cursor-pointer shadow-2xs"
              >
                S
              </button>

              <button
                type="button"
                onClick={handleSuperscript}
                title="Superscript (<sup>text</sup>)"
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[11px] sm:text-xs font-bold bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-900 cursor-pointer"
              >
                A<sup>S</sup>
              </button>

              <button
                type="button"
                onClick={handleSubscript}
                title="Subscript (<sub>text</sub>)"
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[11px] sm:text-xs font-bold bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-900 cursor-pointer"
              >
                A<sub>S</sub>
              </button>

              <button
                type="button"
                onClick={handleInlineCode}
                title="Inline Code (`code`)"
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[11px] sm:text-xs font-mono font-bold bg-white hover:bg-slate-200 border border-slate-300 rounded text-cyan-800 cursor-pointer"
              >
                &lt;&gt;
              </button>
            </div>
          </div>
        )}

        {/* Text Area Canvas & Preview */}
        <div className="bg-white w-full max-w-full overflow-hidden">
          {mode === 'editor' && (
            <textarea
              ref={textareaRef}
              rows={rows}
              value={textContent}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleSelectionChange}
              onClick={handleSelectionChange}
              onKeyUp={handleSelectionChange}
              className="w-full p-3 sm:p-4 font-mono text-sm sm:text-base text-slate-900 bg-white focus:outline-none leading-relaxed resize-y"
              placeholder="It was a dark and stormy night..."
            />
          )}

          {mode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300">
              <textarea
                ref={textareaRef}
                rows={rows}
                value={textContent}
                onChange={(e) => onChange(e.target.value)}
                onSelect={handleSelectionChange}
                onClick={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                className="w-full p-3 sm:p-4 font-mono text-xs sm:text-sm text-slate-900 bg-white focus:outline-none leading-relaxed resize-y min-h-[200px]"
                placeholder="Type content here..."
              />
              <div className="p-3 sm:p-4 bg-slate-50 overflow-y-auto max-h-[350px] sm:max-h-[400px]">
                <div className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-2">Live Rendered Preview</div>
                {renderPreviewContent(textContent)}
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div className="p-4 sm:p-6 bg-slate-50 min-h-[220px]">
              <div className="max-w-2xl mx-auto">
                <div className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-3">Live Article Preview</div>
                {renderPreviewContent(textContent)}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar at Bottom */}
        <div className="bg-slate-200 border-t border-slate-300 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] sm:text-xs font-bold text-slate-600 font-mono gap-1">
          <div>
            <span>{cursorPos.line}:{cursorPos.col}</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span>{wordCount} Words</span>
            <span>•</span>
            <span>{charCount} Chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
