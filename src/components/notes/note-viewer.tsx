/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

interface NoteViewerProps {
    content: string
    className?: string
}

export function NoteViewer({ content, className }: NoteViewerProps) {
    if (!content.trim()) {
        return (
            <div className={`text-muted-foreground italic ${className}`}>
                No content
            </div>
        )
    }

    return (
        <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                    // Custom styling for different markdown elements
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-muted pl-4 italic my-4">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children, ...props }) => {
                        const inline = 'inline' in props && props.inline
                        return inline ? (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                                {children}
                            </code>
                        )
                    },
                    pre: ({ children }) => <pre className="bg-muted p-3 rounded overflow-x-auto mb-3">{children}</pre>,
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-3">
                            <table className="min-w-full border-collapse border border-border">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-border px-3 py-2 bg-muted font-semibold text-left">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-border px-3 py-2">
                            {children}
                        </td>
                    ),
                    a: ({ href, children }) => (
                        <a 
                            href={href} 
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
