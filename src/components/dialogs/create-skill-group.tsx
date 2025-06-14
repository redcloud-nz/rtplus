/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useState, type ReactNode, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { SkillGroupFormData, skillGroupFormSchema } from '@/lib/forms/skill-group'
import { nanoId8 } from '@/lib/id'
import { SkillGroupBasic, useTRPC } from '@/trpc/client'
import { ObjectName } from '../ui/typography'



export function CreateSkillGroupDialog_sys({ skillPackageId, trigger }: { skillPackageId?: string, trigger: ReactNode }) {

    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Skill Group</DialogTitle>
                <DialogDescription>Create a new skill group.</DialogDescription>
            </DialogHeader>
            <DialogBody>
                {open ? <CreateSkillGroupForm_sys skillPackageId={skillPackageId} onClose={() => setOpen(false)} /> : null}
            </DialogBody>
        </DialogContent>
    </Dialog>
}

function CreateSkillGroupForm_sys({ skillPackageId, onClose }: { skillPackageId?: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillPackages } = useSuspenseQuery(trpc.skillPackages.all.queryOptions({}))

    const skillGroupId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillGroupFormData>({
        resolver: zodResolver(skillGroupFormSchema),
        defaultValues: {
            skillGroupId,
            skillPackageId: skillPackageId ?? '',
            name: '',
            status: 'Active',
        },
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillGroups.sys_create.mutationOptions({
        async onMutate({ skillGroupId, ...formData }) {
            await queryClient.cancelQueries(trpc.skillGroups.all.queryFilter({}))

            const newGroup = { ...formData, id: skillGroupId, sequence: 0, _count: { skills: 0 } } satisfies SkillGroupBasic

            const previousAllGroups = queryClient.getQueryData(trpc.skillGroups.all.queryKey({}))
            if (previousAllGroups) {
                queryClient.setQueryData(trpc.skillGroups.all.queryKey({}), [ ...previousAllGroups, newGroup ])
            }
            handleClose()
            return { previousAllGroups }
        },
        onError(error, data, context) {
        
            queryClient.setQueryData(trpc.skillGroups.all.queryKey({}), context?.previousAllGroups)

            toast({
                title: 'Error creating skill group',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(skillGroup) {
            toast({
                title: 'Skill group created',
                description: <>The skill group <ObjectName>{skillGroup.name}</ObjectName> has been successfully created.</>,
            })
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="max-w-xl space-y-4">
            {skillPackageId
                ? <FormItem>
                    <FormLabel>Skill Package</FormLabel>
                    <FormControl>
                        <FixedFormValue value={skillPackages.find(pkg => pkg.id === skillPackageId)?.name ?? 'Unknown Skill Package'}/>
                    </FormControl>
                </FormItem>
                : <FormField
                    control={form.control}
                    name="skillPackageId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Skill Package</FormLabel>
                            <FormControl>
                                <Select {...field} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a skill package" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {skillPackages.map(pkg => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                {pkg.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            }
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Skill Group Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter skill group name" {...field} />
                        </FormControl>
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