/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import z from 'zod'

import { Protect } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillGroupData, skillGroupSchema } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'





/**
 * Card that displays the details of a skill group and allows the user to edit or delete it.
 * @param skillGroupId The ID of the skill group to display.
 * @param skillPackageId The ID of the skill package that the skill group belongs to.
 */
export function AdminModule_SkillGroupDetails({ organization, skillGroupId, skillPackageId }: { organization: OrganizationData, skillGroupId: string, skillPackageId: string }) {


    const { data: skillGroup } = useSuspenseQuery(trpc.skills.getGroup.queryOptions({ orgId: organization.orgId, skillGroupId, skillPackageId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>

            <CardActions>
                <Protect role="org:admin">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setMode('Update')}>
                                <PencilIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit skill group</TooltipContent>
                    </Tooltip>
                    <DeleteSkillGroupDialog organization={organization} skillGroup={skillGroup} />
                </Protect>
                

                <Separator orientation="vertical"/>

                <CardExplanation>
                    This skill group is used to organize related skills within a skill package. 
                    It helps categorize and structure skills for better management and understanding.
                    <br/>
                    <br/>
                    You can edit the skill group details or delete it if it is no longer needed.
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Skill Group ID"
                            control={<DisplayValue>{skillGroup.skillGroupId}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Skill Package"
                            control={
                                <DisplayValue>
                                    <TextLink to={Paths.org(organization.slug).spm.skillPackage(skillGroup.skillPackageId)}>
                                        {skillGroup.skillPackage.name}
                                    </TextLink>
                                </DisplayValue>
                            }
                        />
                        <ToruGridRow
                            label="Name"
                            control={<DisplayValue>{skillGroup.name}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Description"
                            control={
                                <DisplayValue variant="paragraph">
                                    {skillGroup.description || <span className="text-muted-foreground">No description provided.</span>}
                                </DisplayValue>
                            }
                        />
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>{skillGroup.status}</DisplayValue>}
                        />
                        <ToruGridFooter/>
                    </ToruGrid>
                )
                .with('Update', () => 
                    <UpdateSkillGroupForm
                        organization={organization}
                        skillGroup={skillGroup}
                        skillPackage={skillGroup.skillPackage}
                        onClose={() => setMode('View')}
                    />
                )
                .exhaustive()
            }
        </CardContent>
    </Card>
}


/**
 * Form to update a skill group.
 * @param onClose Callback to close the form.
 * @param skillGroup The skill group to update.
 */
function UpdateSkillGroupForm({ onClose, organization, skillGroup, skillPackage }: { onClose: () => void, organization: OrganizationData, skillGroup: SkillGroupData, skillPackage: SkillPackageData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    

    const form = useForm<SkillGroupData>({
        resolver: zodResolver(skillGroupSchema),
        defaultValues: { ...skillGroup }
    })

    const mutation = useMutation(trpc.skills.updateGroup.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillGroupData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error updating skill group',
                    description: error.message,
                    variant: 'destructive',
                })
                onClose()
            }
        },
        onSuccess(result) {
            toast({
                title: 'Skill Group Updated',
                description: <>The skill group <ObjectName>{result.name}</ObjectName> has been updated successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getGroups.queryFilter())
            queryClient.invalidateQueries(trpc.skills.getGroup.queryFilter({ skillGroupId: result.skillGroupId }))
            onClose()
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
            <ToruGrid mode="form">
                <FormField
                    control={form.control}
                    name="skillGroupId"
                    render={({ field }) => <ToruGridRow
                        label="Skill Group ID"
                        control={<DisplayValue>{field.value}</DisplayValue>}
                    />}
                />
                <FormField
                    control={form.control}
                    name="skillPackageId"
                    render={() => <ToruGridRow
                        label="Skill Package"
                        control={
                            <DisplayValue>
                                <TextLink to={Paths.org(organization.slug).spm.skillPackage(skillPackage.skillPackageId)}>
                                    {skillPackage.name}
                                </TextLink>
                            </DisplayValue>
                        }
                    />}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => <ToruGridRow
                        label="Name"
                        control={<Input maxLength={100} {...field} />}
                        description="The name of the skill group."
                    />}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => <ToruGridRow
                        label="Description"
                        control={<Textarea maxLength={500} {...field} />}
                        description="A brief description of the skill group."
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
 * Dialog component to delete a skill group.
 * It requires the user to confirm by entering the skill group name.
 * @param skillGroup The skill group to delete.
 */
function DeleteSkillGroupDialog({ organization, skillGroup }: { organization: OrganizationData, skillGroup: SkillGroupData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    

    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            skillPackageId: zodNanoId8,
            skillGroupId: zodNanoId8,
            skillGroupName: z.literal(skillGroup.name)
        })),
        mode: 'onSubmit',
        defaultValues: { skillPackageId: skillGroup.skillPackageId, skillGroupId: skillGroup.skillGroupId, skillGroupName: "" }
    })

    const mutation = useMutation(trpc.skills.deleteGroup.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting skill group',
                description: error.message,
                variant: 'destructive'
            })
            setOpen(false)
        },
        onSuccess(result) {
            toast({
                title: 'Skill Group deleted',
                description: <>The skill group <ObjectName>{result.name}</ObjectName> has been deleted.</>,
            })
            setOpen(false)

            queryClient.invalidateQueries(trpc.skills.getGroups.queryFilter())
            queryClient.invalidateQueries(trpc.skills.getGroup.queryFilter({ skillGroupId: skillGroup.skillGroupId }))
            router.push(Paths.org(organization.slug).spm.skillPackage(skillGroup.skillPackageId).group(skillGroup.skillGroupId).href)
        }
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete Skill Group">
            <TrashIcon/>
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Group</DialogTitle>
                <DialogDescription>This will remove the skill group from RT+ forever (which is a really long time). </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
                        <FormItem>
                            <FormLabel>Skill Group</FormLabel>
                            <FormControl>
                                <DisplayValue>{skillGroup.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="skillGroupName"
                            render={({ field }) => <FormItem>
                                <FormLabel>Enter name</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        placeholder="Type the skill group name to confirm" 
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