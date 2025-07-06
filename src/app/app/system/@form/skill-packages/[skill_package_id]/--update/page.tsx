/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { pick } from 'remeda'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs, UpdateFormProps } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SkillPackageFormData, skillPackageFormSchema } from '@/lib/forms/skill-package'
import { SkillPackage, useTRPC } from '@/trpc/client'



export default function UpdateSkillPackageSheet(props: { params: Promise<{ skill_package_id: string}> }) {
    const { skill_package_id: skillPackageId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Update Skill Package</SheetTitle>
                <SheetDescription>Edit the details of the skill package.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <UpdateSkillPackageForm 
                    skillPackageId={skillPackageId} 
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>
}

function UpdateSkillPackageForm({ skillPackageId, onClose }: UpdateFormProps<SkillPackage> & { skillPackageId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

    const form = useForm<SkillPackageFormData>({
        resolver: zodResolver(skillPackageFormSchema),
        defaultValues: { skillPackageId, ...pick(skillPackage, ['description', 'name', 'status']) }
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillPackages.sys_update.mutationOptions({
        onMutate({ skillPackageId, ...formData }) {
            // Cancel any ongoing queries for the skill package
            queryClient.cancelQueries(trpc.skillPackages.byId.queryFilter({ skillPackageId }))
            
            // Optimistically update the skill package in the cache
            const previousSkillPackage = queryClient.getQueryData<SkillPackage>(trpc.skillPackages.byId.queryKey({ skillPackageId }))

            if(previousSkillPackage) {
                queryClient.setQueryData(trpc.skillPackages.byId.queryKey({ skillPackageId }), { ...previousSkillPackage, ...formData })
            }

            return { previousSkillPackage }
        },
        onError(error, data, context) {
            // Rollback to previous data if mutation fails
            queryClient.setQueryData(trpc.skillPackages.byId.queryKey({ skillPackageId }), context?.previousSkillPackage)

            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillPackageFormData, { message: error.shape.message })
            } else {
                    toast({
                    title: 'Error updating skill package',
                    description: error.message,
                    variant: 'destructive'
                })
                handleClose()
            }
        },
        onSuccess(result) {
            toast({ 
                title: 'Skill package updated', 
                description: <>The skill package <ObjectName>{result.name}</ObjectName> has been updated successfully.</>
            })
            handleClose()

        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillPackages.byId.queryFilter({ skillPackageId }))
            queryClient.invalidateQueries(trpc.skillPackages.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync(formData))}>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => 
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>The name of the skill package.</FormDescription>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Package Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormDescription>A description of what this skill package contains and who it applies to.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
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
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}