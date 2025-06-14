/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ReactNode, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ObjectName } from '@/components/ui/typography'

import { SkillGroupFormData, skillGroupFormSchema } from '@/lib/forms/skill-group'
import { useToast } from '@/hooks/use-toast'
import { useTRPC } from '@/trpc/client'



export function EditSkillGroupDialog_sys({ skillGroupId, trigger }: { skillGroupId: string, trigger: ReactNode }) {
    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Skill Group</DialogTitle>
                <DialogDescription>
                    Edit the details of this skill group.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                {open ? <EditSkillGroupForm_sys skillGroupId={skillGroupId} onClose={() => setOpen(false)} /> : null}
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function EditSkillGroupForm_sys({ skillGroupId, onClose }: { skillGroupId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillGroup } = useSuspenseQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId }))

    const form = useForm<SkillGroupFormData>({
        resolver: zodResolver(skillGroupFormSchema),
        defaultValues: {
            skillGroupId,
            skillPackageId: skillGroup.skillPackageId,
            name: skillGroup.name,
            status: skillGroup.status,
        }
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillGroups.sys_update.mutationOptions({
        async onMutate({ skillGroupId, ...formData }) {
            await queryClient.cancelQueries(trpc.skillGroups.byId.queryFilter({ skillGroupId }))

            const previousData = queryClient.getQueryData(trpc.skillGroups.byId.queryKey({ skillGroupId }))
            if(previousData) {
                queryClient.setQueryData(trpc.skillGroups.byId.queryKey({ skillGroupId }), {
                    ...previousData,
                    ...formData,
                })
            }
            
            handleClose()
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.skillGroups.byId.queryKey({ skillGroupId }), context?.previousData)
            
            toast({ title: 'Error updating skill group', description: error.message, variant: 'destructive' })
        },
        onSuccess(updatedSkillGroup) {
            toast({
                title: 'Skill Group updated successfully',
                description: <>Skill Group <ObjectName>{updatedSkillGroup.name}</ObjectName> has been updated.</>,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillGroups.byId.queryFilter({ skillGroupId }))
            queryClient.invalidateQueries(trpc.skillGroups.all.queryFilter())
        }
        
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-2xl space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => 
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => 
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.update}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider>
}