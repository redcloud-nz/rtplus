/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SkillPackageData, skillPackageSchema } from '@/lib/schemas/skill-package'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'




/**
 * Card that displays the details of a skill package and allows the user to edit or delete it.
 * @param skillPackageId The ID of the skill package to display.
 */
export function SkillPackageDetailsCard({ skillPackageId }: { skillPackageId: string }) {

    const trpc = useTRPC()
    const { data: skillPackage } = useSuspenseQuery(trpc.skills.getPackage.queryOptions({ skillPackageId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>

            <CardActions>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setMode('Update')}>
                            <PencilIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit skill package</TooltipContent>
                </Tooltip>
                 <DeleteSkillPackageDialog skillPackage={skillPackage}  />

                 <Separator orientation="vertical"/>

                 <CardExplanation>
                    This skill package is used to group related skills together. 
                    It can be used to define a set of skills that are required for a specific role or task.
                    <br/>
                    <br/>
                    You can edit the skill package details or delete it if it is no longer needed.
                 </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Skill Package ID"
                            control={<DisplayValue>{skillPackage.skillPackageId}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Name"
                            control={<DisplayValue>{skillPackage.name}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Description"
                            control={<DisplayValue variant="paragraph">{skillPackage.description}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>{skillPackage.status}</DisplayValue>}
                        />
                        <ToruGridFooter/>
                    </ToruGrid>
                )
                .with('Update', () => 
                    <UpdateSkillPackageForm
                        skillPackage={skillPackage}
                        onClose={() => setMode('View')}
                    />
                )
                .exhaustive()
            }
        </CardContent>
    </Card>
}


/**
 * Form to update a skill package.
 * @param onClose Callback to close the form.
 * @param skillPackage The skill package to update.
 */
function UpdateSkillPackageForm({ onClose, skillPackage }: { onClose: () => void, skillPackage: SkillPackageData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<SkillPackageData>({
        resolver: zodResolver(skillPackageSchema),
        defaultValues: {
            ...skillPackage
        }
    })

    const mutation = useMutation(trpc.skills.updatePackage.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillPackageData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error updating skill package',
                    description: error.message,
                    variant: 'destructive',
                })
                onClose()
            }
        },
        onSuccess(result) {
            toast({
                title: 'Skill Package Updated',
                description: <>The skill package <ObjectName>{result.name}</ObjectName> has been updated successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getPackages.queryFilter())
            queryClient.invalidateQueries(trpc.skills.getPackage.queryFilter({ skillPackageId: result.skillPackageId }))
            onClose()
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
            <ToruGrid mode="form">
                <FormField
                    control={form.control}
                    name="skillPackageId"
                    render={({ field }) => <ToruGridRow
                        label="Skill Package ID"
                        control={ <DisplayValue>{field.value}</DisplayValue>}
                    />}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => <ToruGridRow
                        label="Name"
                        control={<Input maxLength={100} {...field} />}
                        description="The name of the skill package."
                    />}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => <ToruGridRow
                        label="Description"
                        control={<Textarea maxLength={500} {...field} />}
                        description="A brief description of the skill package."
                    />}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => <ToruGridRow
                        label="Status"
                        control={
                            <Select {...field} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        description="The current status of the team."
                    />}
                />
                <ToruGridFooter>
                    <FormSubmitButton labels={SubmitVerbs.update} size="sm"/>
                    <FormCancelButton onClick={onClose} size="sm"/>
                </ToruGridFooter>
            </ToruGrid>
        </Form>
    </FormProvider>
}

/**
 * Dialog component to delete a skill package.
 * It requires the user to confirm by entering the skill package name.
 * @param skillPackage The skill package to delete.
 */
function DeleteSkillPackageDialog({ skillPackage }: { skillPackage: SkillPackageData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            skillPackageId: zodNanoId8,
            skillPackageName: z.literal(skillPackage.name)
        })),
        mode: 'onSubmit',
        defaultValues: { skillPackageId: skillPackage.skillPackageId, skillPackageName: "" }
    })

    const mutation = useMutation(trpc.skills.deletePackage.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting skill package',
                description: error.message,
                variant: 'destructive'
            })
            setOpen(false)
        },
        onSuccess(result) {
            toast({
                title: 'Skill Package deleted',
                description: <>The skill package <ObjectName>{result.name}</ObjectName> has been deleted.</>,
            })
            setOpen(false)

            queryClient.invalidateQueries(trpc.skills.getPackages.queryFilter())
            queryClient.invalidateQueries(trpc.skills.getPackage.queryFilter({ skillPackageId: skillPackage.skillPackageId }))
            queryClient.invalidateQueries(trpc.skills.getGroups.queryFilter({ skillPackageId: skillPackage.skillPackageId }))
            router.push(Paths.system.skillPackages.index)
        }
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete Skill Package">
            <TrashIcon/>
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Package</DialogTitle>
                <DialogDescription>This will remove the skill package from RT+ forever (which is a really long time). </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                        <FormItem>
                            <FormLabel>Skill Package</FormLabel>
                            <FormControl>
                                <DisplayValue>{skillPackage.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="skillPackageName"
                            render={({ field }) => <FormItem>
                                <FormLabel>Enter name</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        placeholder="Type the skill package name to confirm" 
                                        maxLength={100} 
                                        autoComplete="off" 
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormActions>
                            <FormSubmitButton 
                                labels={SubmitVerbs.delete} 
                                color="destructive"
                            />
                            <FormCancelButton onClick={() => setOpen(false)}/>
                        </FormActions>
                    </Form>
                </FormProvider>
            </DialogBody>
        </DialogContent>
    </Dialog>
}