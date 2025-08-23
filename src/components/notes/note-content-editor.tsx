/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use client'

import { MarkdownEditor } from '../markdown/editor'

interface NoteEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    className?: string
}

export function NoteContentEditor({ content, onChange, placeholder = "Write your note...", className }: NoteEditorProps) {
    return (
        <div className={className}>
            <MarkdownEditor
                markdown={content}
                onChange={onChange}
                placeholder={placeholder}
                contentEditableClassName="min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
        </div>
    )
}
