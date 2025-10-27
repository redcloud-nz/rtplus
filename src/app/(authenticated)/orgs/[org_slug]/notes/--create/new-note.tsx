/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { MoreVerticalIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { MarkdownEditor } from '@/components/markdown/editor'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardAction, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'

import { useToast } from '@/hooks/use-toast'
import { nanoId8 } from '@/lib/id'
import { NoteData, noteSchema } from '@/lib/schemas/note'
import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'
import { FloatingFooter } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { DebugFormState } from '@/components/ui/form'
import { Field, FieldError } from '@/components/ui/field'
import { S2_Input } from '@/components/ui/s2-input'






export function NotesModule_NewNote_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const noteId = useMemo(() => nanoId8(), [])

    const form = useForm<NoteData>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            noteId,
            title: '',
            content: '',
            tags: [],
            properties: {},
            status: 'Published',
        }
    })

    const mutation = useMutation(trpc.notes.createNote.mutationOptions({
        async onMutate(data) {
            console.log("Creating note with data", data)
        },
        async onError(error, _data, context) {

            toast({
                title: 'Error creating note',
                description: error.message,
                variant: 'destructive',
            })
        }
    }))

    return <FormProvider {...form}>
        <form 
            id="new-note-form"
            onSubmit={form.handleSubmit((formData) => mutation.mutate({ ...formData, orgId: organization.orgId }))}
        >
            <S2_Card className="gap-0 max-h-[calc(100vh-var(--header-height)-var(--spacing))] min-h-[220px] flex flex-col">
                <S2_CardHeader>
                    <S2_CardTitle>
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => <Field>
                                <S2_Input
                                    value={field.value}
                                    onChange={field.onChange}
                                    aria-invalid={fieldState.invalid}
                                    autoFocus
                                    id="note-title"
                                    placeholder="Note title..."
                                    className="border-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
                                />
                                <FieldError>{fieldState.error?.message}</FieldError>
                            </Field>}
                        />
                    </S2_CardTitle>
                    {/* <S2_CardAction>
                        <S2_Button variant="ghost">
                            <MoreVerticalIcon/>
                        </S2_Button>
                    </S2_CardAction> */}
                </S2_CardHeader>
                <S2_CardContent>
                    <Controller
                        name="content"
                        control={form.control}
                        render={({ field }) => (
                            <MarkdownEditor markdown={field.value} onChange={field.onChange} placeholder="Write your note here..." />
                        )}
                    />
                </S2_CardContent>
            </S2_Card>
            <FloatingFooter open={form.formState.isDirty || mutation.isPending}>
                {mutation.isPending ?
                    <div className="animate-pulse text-sm text-muted-foreground p-2">Saving changes...</div>
                    : <>
                        <div className="text-sm text-white p-2">Save changes?</div>
                        <Button 
                            type="submit"
                            size="sm"
                            color="blue"
                            form="new-note-form"
                            
                        >Save</Button>
                            
                        <Button
                            type="button"
                            size="sm"
                            color="red"
                            onClick={() => form.reset()}
                        >Reset</Button>
                    </>
                }
            </FloatingFooter>
        </form>
    </FormProvider>
}
                    