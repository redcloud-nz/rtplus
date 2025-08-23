/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useTRPC } from '@/trpc/client'
import { NotesList } from '@/components/notes'
import { nanoId8 } from '@/lib/id'

export function Personal_NotesList() {
    const { toast } = useToast()
    const trpc = useTRPC()
    const [creatingNote, setCreatingNote] = useState(false)
    const [updatingNoteIds, setUpdatingNoteIds] = useState<Set<string>>(new Set())
    const [deletingNoteIds, setDeletingNoteIds] = useState<Set<string>>(new Set())

    // Queries
    const { data: notes = [], refetch } = useQuery(trpc.notes.getPersonalNotes.queryOptions())

    // Mutations
    const createNoteMutation = useMutation(trpc.notes.createNote.mutationOptions({
        onSuccess: () => {
            refetch()
            toast({
                title: 'Success',
                description: 'Note created successfully',
            })
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSettled: () => {
            setCreatingNote(false)
        }
    }))

    const updateNoteMutation = useMutation(trpc.notes.updateNote.mutationOptions({
        onSuccess: () => {
            refetch()
            toast({
                title: 'Success',
                description: 'Note updated successfully',
            })
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSettled: (_data, _error, variables) => {
            setUpdatingNoteIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(variables.noteId)
                return newSet
            })
        }
    }))

    const deleteNoteMutation = useMutation(trpc.notes.deleteNote.mutationOptions({
        onSuccess: () => {
            refetch()
            toast({
                title: 'Success',
                description: 'Note deleted successfully',
            })
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSettled: (_data, _error, variables) => {
            setDeletingNoteIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(variables.noteId)
                return newSet
            })
        }
    }))

    const handleCreateNote = async (content: string) => {
        setCreatingNote(true)
        await createNoteMutation.mutateAsync({
            noteId: nanoId8(), // Generate a new unique ID for the note
            title: "New Note", // Default title, can be set later
            date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            content,
            teamId: null, // Personal notes don't have a teamId
            personId: null, // This will be set automatically by the backend based on the authenticated user
        })
    }

    const handleUpdateNote = async (noteId: string, content: string) => {
        setUpdatingNoteIds(prev => new Set(prev).add(noteId))
        await updateNoteMutation.mutateAsync({ noteId, title: "", content, date: new Date().toISOString().split('T')[0] })
    }

    const handleDeleteNote = async (noteId: string) => {
        setDeletingNoteIds(prev => new Set(prev).add(noteId))
        await deleteNoteMutation.mutateAsync({ noteId })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <NotesList
                notes={notes}
                title="My Personal Notes"
                emptyMessage="You haven't created any personal notes yet. Click 'New Note' to get started."
                canCreate={true}
                canEdit={true}
                canDelete={true}
                onCreate={handleCreateNote}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                isCreating={creatingNote}
                updatingNoteIds={updatingNoteIds}
                deletingNoteIds={deletingNoteIds}
            />
        </div>
    )
}
