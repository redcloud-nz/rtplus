'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NoteItem } from './note-item'
import { NoteForm } from './note-form'
import { Plus } from 'lucide-react'
import { NoteData } from '@/lib/schemas/note'

interface NotesListProps {
    notes: NoteData[]
    title: string
    emptyMessage: string
    canCreate?: boolean
    canEdit?: boolean
    canDelete?: boolean
    onCreate?: (content: string) => Promise<void>
    onUpdate?: (noteId: string, content: string) => Promise<void>
    onDelete?: (noteId: string) => Promise<void>
    isCreating?: boolean
    updatingNoteIds?: Set<string>
    deletingNoteIds?: Set<string>
}

export function NotesList({
    notes,
    title,
    emptyMessage,
    canCreate = false,
    canEdit = false,
    canDelete = false,
    onCreate,
    onUpdate,
    onDelete,
    isCreating = false,
    updatingNoteIds = new Set(),
    deletingNoteIds = new Set()
}: NotesListProps) {
    const [isCreatingNote, setIsCreatingNote] = useState(false)

    const handleCreate = async (content: string) => {
        if (onCreate) {
            await onCreate(content)
            setIsCreatingNote(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{title}</h1>
                {canCreate && !isCreatingNote && (
                    <Button onClick={() => setIsCreatingNote(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Note
                    </Button>
                )}
            </div>

            {isCreatingNote && (
                <NoteForm
                    title="Create New Note"
                    onSave={handleCreate}
                    onCancel={() => setIsCreatingNote(false)}
                    isLoading={isCreating}
                />
            )}

            <div className="space-y-4">
                {notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    notes.map((note) => (
                        <NoteItem
                            key={note.noteId}
                            noteId={note.noteId}
                            content={note.content}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isUpdating={updatingNoteIds.has(note.noteId)}
                            isDeleting={deletingNoteIds.has(note.noteId)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
