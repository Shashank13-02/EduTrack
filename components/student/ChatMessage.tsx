'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{ title?: string; category?: string }>;
  createdAt?: Date | string;
}

export function ChatMessageComponent({ role, content, sources, createdAt }: ChatMessageProps) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex gap-3 mb-6 last:mb-0',
        isUser ? 'flex-row-reverse items-start' : 'flex-row items-start',
        'md:gap-4'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md',
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600',
          'md:w-10 md:h-10'
        )}
      >
        {isUser ? <User className="w-4 h-4 text-white md:w-5 md:h-5" /> : <Bot className="w-4 h-4 text-white md:w-5 md:h-5" />}
      </div>
      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[85%] md:max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl shadow-md',
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none'
              : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-slate-700/50 rounded-tl-none',
            'md:px-5 md:py-4'
          )}
        >
          {/* Markdown Rendering */}
          <div
            className={cn(
              'text-sm md:text-base leading-relaxed',
              isUser
                ? 'prose prose-invert max-w-none'
                : 'prose dark:prose-invert max-w-none'
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => <h1 className="text-xl font-bold mt-3 mb-2 md:text-2xl">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 md:text-xl">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-2 md:text-lg">{children}</h3>,
                ul: ({ children }) => <ul className="ml-5 list-disc space-y-2 md:space-y-3">{children}</ul>,
                ol: ({ children }) => <ol className="ml-5 list-decimal space-y-2 md:space-y-3">{children}</ol>,
                hr: () => <hr className="my-4 border-gray-200 dark:border-slate-700" />,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700/50 text-sm md:text-base">
                    {children}
                  </code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        {/* Sources */}
        {isAssistant && sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((source, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full shadow-sm md:text-sm md:px-3 md:py-1.5"
              >
                📚 {source.title || source.category || 'Source'}
              </span>
            ))}
          </div>
        )}
        {/* Timestamp */}
        {createdAt && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 dark:text-gray-400 md:text-sm md:mt-2">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            <span>{format(new Date(createdAt), 'hh:mm a')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}