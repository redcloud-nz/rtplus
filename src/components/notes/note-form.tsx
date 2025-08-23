'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { NoteEditor } from './note-editor'

interface NoteFormProps {
    initialContent?: string
    title: string
    onSave: (content: string) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function NoteForm({ 
    initialContent = '', 
    title, 
    onSave, 
    onCancel, 
    isLoading = false 
}: NoteFormProps) {
    const [content, setContent] = useState(initialContent)

    const handleSave = async () => {
        await onSave(content)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <NoteEditor
                    content={content}
                    onChange={setContent}
                    className="min-h-[300px]"
                />
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button 
                    onClick={handleSave}
                    disabled={isLoading || !content.trim()}
                >
                    {isLoading ? 'Saving...' : 'Save Note'}
                </Button>
                <Button 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </CardFooter>
        </Card>
    )
}
