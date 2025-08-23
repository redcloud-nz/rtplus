'use client'

import { useState } from 'react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useTRPC } from '@/trpc/client'
import { NotesList } from '@/components/notes'
import { nanoId16, nanoId8} from '@/lib/id'

export default function TeamNotesPage() {
    const { toast } = useToast()
    const trpc = useTRPC()
    const [creatingNote, setCreatingNote] = useState(false)
    const [updatingNoteIds, setUpdatingNoteIds] = useState<Set<string>>(new Set())
    const [deletingNoteIds, setDeletingNoteIds] = useState<Set<string>>(new Set())

    // Get the current team
    const { data: team } = useSuspenseQuery(trpc.activeTeam.getTeam.queryOptions())
    
    // Queries
    const notesQuery = useSuspenseQuery(trpc.notes.getTeamNotes.queryOptions({ teamId: team.teamId }))
    const notes = notesQuery.data

    // Mutations
    const createNoteMutation = useMutation(trpc.notes.createNote.mutationOptions({
        onSuccess: () => {
            notesQuery.refetch()
            toast({
                title: 'Success',
                description: 'Team note created successfully',
            })
        },
        onError: (error: any) => {
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
            notesQuery.refetch()
            toast({
                title: 'Success',
                description: 'Team note updated successfully',
            })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSettled: (_data: any, _error: any, variables: any) => {
            setUpdatingNoteIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(variables.noteId)
                return newSet
            })
        }
    }))

    const deleteNoteMutation = useMutation(trpc.notes.deleteNote.mutationOptions({
        onSuccess: () => {
            notesQuery.refetch()
            toast({
                title: 'Success',
                description: 'Team note deleted successfully',
            })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSettled: (_data: any, _error: any, variables: any) => {
            setDeletingNoteIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(variables.noteId)
                return newSet
            })
        }
    }))

    const handleCreateNote = async (content: string) => {
        setCreatingNote(true)
        try {
            await createNoteMutation.mutateAsync({
                noteId: nanoId8(),
                content,
                teamId: team.teamId,
                personId: null, // Team notes don't have a personId
            })
        } catch (error) {
            // Error is handled in onError callback
        }
    }

    const handleUpdateNote = async (noteId: string, content: string) => {
        setUpdatingNoteIds(prev => new Set(prev).add(noteId))
        try {
            await updateNoteMutation.mutateAsync({ noteId, content })
        } catch (error) {
            // Error is handled in onError callback
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        setDeletingNoteIds(prev => new Set(prev).add(noteId))
        try {
            await deleteNoteMutation.mutateAsync({ noteId })
        } catch (error) {
            // Error is handled in onError callback
        }
    }

    // We'll show create/edit/delete buttons based on whether operations succeed
    // If user is not admin, the TRPC calls will fail and show appropriate error messages
    return (
        <div className="container mx-auto px-4 py-8">
            <NotesList
                notes={notes}
                title={`${team.name} Team Notes`}
                emptyMessage="No team notes have been created yet."
                canCreate={true} // Show the button, let TRPC handle permissions
                canEdit={true}   // Show the button, let TRPC handle permissions
                canDelete={true} // Show the button, let TRPC handle permissions
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
