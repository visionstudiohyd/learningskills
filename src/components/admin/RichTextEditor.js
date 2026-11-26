'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect, useState } from 'react';
import {
  Bold, Code, Heading2, Heading3, Italic, Link2, Link2Off, List, ListOrdered,
  Minus, Quote, Redo2, Strikethrough, Undo2,
} from 'lucide-react';
import { cx } from '@/lib/utils';

/**
 * Rich text editor for course overviews and CMS page bodies.
 *
 * Tiptap over a contenteditable div, deliberately restricted to the marks the
 * public `.prose-cms` styles actually render — there is no point offering the
 * admin a control whose output the site will not style. Output is HTML stored
 * directly in the column.
 */

function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cx(
        'grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:opacity-40',
        active ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value = '', onChange, placeholder = 'Start writing…', minHeight = 320 }) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    // Tiptap renders differently on the server; this avoids a hydration warning.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose-cms focus:outline-none px-4 py-3.5',
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      // Tiptap represents "empty" as <p></p>; store an empty string instead.
      onChange?.(html === '<p></p>' ? '' : html);
    },
  });

  useEffect(() => setMounted(true), []);

  // Keep in sync when the form resets or loads a different record.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || '';
    if (incoming !== current && !(incoming === '' && current === '<p></p>')) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href || '';
    // eslint-disable-next-line no-alert
    const url = window.prompt('Link URL (leave empty to remove the link)', previous);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const safe = /^(https?:|mailto:|tel:|\/)/i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: safe }).run();
  }, [editor]);

  if (!mounted || !editor) {
    return (
      <div
        className="rounded-xl border border-ink-200 bg-ink-50"
        style={{ minHeight: minHeight + 48 }}
        aria-busy="true"
      >
        <div className="h-11 border-b border-ink-200" />
        <p className="px-4 py-3.5 text-sm text-ink-400">Loading editor…</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-ink-200 bg-ink-50 px-2 py-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" strokeWidth={2.6} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-ink-200" aria-hidden="true" />

        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-ink-200" aria-hidden="true" />

        <ToolbarButton
          label="Bulleted list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" strokeWidth={2.6} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-ink-200" aria-hidden="true" />

        <ToolbarButton label="Add or edit link" active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={!editor.isActive('link')}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off className="h-4 w-4" strokeWidth={2.4} />
        </ToolbarButton>

        <span className="ml-auto flex items-center gap-0.5">
          <ToolbarButton
            label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" strokeWidth={2.4} />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" strokeWidth={2.4} />
          </ToolbarButton>
        </span>
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-4 py-2 text-[0.6875rem] text-ink-500">
        <span>{editor.storage.characterCount?.words?.() ?? editor.getText().trim().split(/\s+/).filter(Boolean).length} words</span>
        <span>Headings, lists, quotes and links are styled to match the site.</span>
      </div>
    </div>
  );
}
