import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

const MarkdownRenderer = ({ content, className = '' }) => {
  const components = {
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-neutral-800 mb-3 mt-6">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-neutral-800 mb-2 mt-4">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-neutral-700 leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-neutral-700">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-neutral-700">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="pl-2">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-300 pl-4 py-2 bg-primary-50 rounded-r-lg mb-4 italic text-neutral-600">
        {children}
      </blockquote>
    ),
    code: ({ children, inline }) => {
      if (inline) {
        return (
          <code className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md text-sm font-mono">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-xl overflow-x-auto mb-4">
          <code className="text-sm font-mono">
            {children}
          </code>
        </pre>
      );
    },
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-neutral-600">
        {children}
      </em>
    ),
    a: ({ href, children }) => (
      <a 
        href={href}
        className="text-primary-600 hover:text-primary-700 underline decoration-primary-300 hover:decoration-primary-500 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    hr: () => (
      <hr className="border-neutral-200 my-6" />
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`prose prose-neutral max-w-none ${className}`}
    >
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};

export default MarkdownRenderer;