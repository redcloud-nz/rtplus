'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { NoteViewer } from './note-viewer'
import { NoteForm } from './note-form'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface NoteItemProps {
    noteId: string
    content: string
    canEdit?: boolean
    canDelete?: boolean
    onUpdate?: (noteId: string, content: string) => Promise<void>
    onDelete?: (noteId: string) => Promise<void>
    isUpdating?: boolean
    isDeleting?: boolean
}

export function NoteItem({
    noteId,
    content,
    canEdit = false,
    canDelete = false,
    onUpdate,
    onDelete,
    isUpdating = false,
    isDeleting = false
}: NoteItemProps) {
    const [isEditing, setIsEditing] = useState(false)

    const handleUpdate = async (newContent: string) => {
        if (onUpdate) {
            await onUpdate(noteId, newContent)
            setIsEditing(false)
        }
    }

    const handleDelete = async () => {
        if (onDelete && confirm('Are you sure you want to delete this note?')) {
            await onDelete(noteId)
        }
    }

    if (isEditing) {
        return (
            <NoteForm
                initialContent={content}
                title="Edit Note"
                onSave={handleUpdate}
                onCancel={() => setIsEditing(false)}
                isLoading={isUpdating}
            />
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm text-muted-foreground">
                    Note #{noteId.slice(-6)}
                </div>
                {(canEdit || canDelete) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <DropdownMenuItem 
                                    onClick={() => setIsEditing(true)}
                                    disabled={isUpdating || isDeleting}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {canDelete && (
                                <DropdownMenuItem 
                                    onClick={handleDelete}
                                    disabled={isUpdating || isDeleting}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardContent>
                <NoteViewer content={content} />
            </CardContent>
        </Card>
    )
}
