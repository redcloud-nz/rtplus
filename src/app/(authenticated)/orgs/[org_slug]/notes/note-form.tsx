/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { MoveLeftIcon, SaveIcon } from 'lucide-react'
import { ComponentProps, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { MarkdownEditor } from '@/components/markdown/editor'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldError } from '@/components/ui/field'
import { S2_Input } from '@/components/ui/s2-input'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { NoteData, noteSchema } from '@/lib/schemas/note'
import { cn } from '@/lib/utils'




type NoteFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    cancelPath: { href: string }
    listPath: { href: string }
    note: NoteData
    onSubmit: (data: NoteData) => Promise<void>
}

export function NotesModule_NoteForm({ cancelPath, className, id: formId = "note-form", listPath,  note, onSubmit,...props }: NoteFormProps) {

    const form = useForm<NoteData>({
        resolver: zodResolver(noteSchema),
        defaultValues: { ...note }
    })

    const [isPending, setIsPending] = useState(false)

    const handleSubmit = form.handleSubmit(async (data) => {
        setIsPending(true)
        await onSubmit(data)
        form.reset(data)
        setIsPending(false)
    })

    return <form
        className={cn('flex flex-col gap-2', className)}
        id={formId}
        onSubmit={handleSubmit}
        {...props}
    >
        <div className="flex w-full gap-2 justify-between">
            <Tooltip>
                <TooltipTrigger asChild>
                    <S2_Button variant="outline" asChild>
                        <Link to={listPath}>
                            <MoveLeftIcon/> List
                        </Link>
                    </S2_Button>
                </TooltipTrigger>
                <TooltipContent>
                    back to list
                </TooltipContent>
            </Tooltip>

            <div className="flex gap-2">
                <S2_Button type="button" variant="outline" disabled={isPending} onClick={() => form.reset()} asChild>
                    <Link to={cancelPath}>
                        Cancel
                    </Link>
                </S2_Button>
                <S2_Button type="submit" disabled={!form.formState.isDirty || isPending}>
                   <SaveIcon /> Save
                </S2_Button>
            </div>
        </div>
        
        <S2_Card className="flex flex-col pb-1 gap-0">
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
                                className="border-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0 px-2"
                            />
                            <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>}
                    />
                </S2_CardTitle>
            </S2_CardHeader>
            <S2_CardContent>
                <Controller
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                        <MarkdownEditor 
                            markdown={field.value} 
                            onChange={field.onChange}
                            placeholder="Write your note here..."
                            contentEditableClassName="max-h-[calc(100vh-var(--header-height)-var(--page-padding)-var(--button-height)-var(--spacing)*2-var(--card-padding)-36px-var(--mdxeditor-toolbar-height)-var(--spacing)-var(--page-padding)-2px)] [scrollbar-gutter:stable] [scrollbar-color:var(--scrollbar-thumb)_var(--scrollbar-track)] overflow-y-auto"
                        />
                    )}
                />
            </S2_CardContent>
        </S2_Card>
    </form>
}