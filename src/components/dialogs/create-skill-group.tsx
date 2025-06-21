/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useMemo, ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'
import { SkillGroupFormData, skillGroupFormSchema } from '@/lib/forms/skill-group'
import { nanoId8 } from '@/lib/id'
import { SkillGroupWithPackage, useTRPC } from '@/trpc/client'


type CreateSkillGroupProps = {
    onCreate?: (skillGroup: SkillGroupWithPackage) => void,
    skillPackageId: string,
}


export function CreateSkillGroupDialog({ onCreate, skillPackageId, ...props }: ComponentProps<typeof Dialog> & CreateSkillGroupProps) {

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Skill Group</DialogTitle>
                <DialogDescription>Create a new skill group.</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <CreateSkillGroupForm 
                    onClose={() => props.onOpenChange?.(false)}
                    onCreate={onCreate}
                    skillPackageId={skillPackageId}
                />
            </DialogBody>
        </DialogContent>
    </Dialog>
}

function CreateSkillGroupForm({ onClose, onCreate, skillPackageId }: CreateSkillGroupProps & { onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId}))

    const skillGroupId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillGroupFormData>({
        resolver: zodResolver(skillGroupFormSchema),
        defaultValues: {
            skillGroupId,
            skillPackageId: skillPackageId ?? '',
            parentId: null,
            name: '',
            description: '',
            status: 'Active',
        },
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillGroups.sys_create.mutationOptions({
        onError(error) {
        
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillGroupFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error creating skill group',
                    description: error.message,
                    variant: 'destructive',
                })
                handleClose()
            }
        },
        async onSuccess(skillGroup) {
            toast({
                title: 'Skill group created',
                description: `The skill group ${skillGroup.name} has been successfully created.`,
            })
            handleClose()
            onCreate?.(skillGroup)

            await queryClient.invalidateQueries(trpc.skillGroups.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skillGroups.bySkillPackageId.queryFilter({ skillPackageId }))
        },

    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="max-w-xl space-y-4">
            <FormItem>
                <FormLabel>Skill Package</FormLabel>
                <FormControl>
                    <FixedFormValue value={skillPackage.name}/>
                </FormControl>
            </FormItem>
               
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                            <Input {...field}/>
                        </FormControl>
                        <FormDescription>The name of the skill package.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Group Description</FormLabel>
                        <FormControl>
                            <Textarea {...field}/>
                        </FormControl>
                        <FormDescription>A description of the skill group.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.create}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}