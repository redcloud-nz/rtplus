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

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'
import { TextLink } from '@/components/ui/link'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillData, skillSchema } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageData } from '@/lib/schemas/skill-package'

import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'





/**
 * Card that displays the details of a skill and allows the user to edit or delete it.
 * @param skillId The ID of the skill to display.
 * @param skillPackageId The ID of the skill package that the skill belongs to.
 */
export function AdminModule_SkillDetails({ organization, skillId, skillPackageId }: { organization: OrganizationData, skillId: string, skillPackageId: string }) {

    const { data: skill } = useSuspenseQuery(trpc.skills.getSkill.queryOptions({ orgId: organization.orgId, skillId, skillPackageId }))

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
                    <TooltipContent>Edit skill</TooltipContent>
                </Tooltip>
                <DeleteSkillDialog organization={organization} skill={skill} />

                <Separator orientation="vertical"/>

                <CardExplanation>
                    This skill defines a specific competency that can be assessed within a skill group. 
                    Skills can be marked as optional or required and have different assessment frequencies.
                    <br/>
                    You can edit the skill details or delete it if it is no longer needed.
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Skill ID"
                            control={<DisplayValue>{skill.skillId}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Skill Package"
                            control={
                                <DisplayValue>
                                    <TextLink to={Paths.org(organization.slug).admin.skillPackage(skill.skillPackageId)}>
                                        {skill.skillPackage.name}
                                    </TextLink>
                                </DisplayValue>
                            }
                        />
                        <ToruGridRow
                            label="Skill Group"
                            control={
                                <DisplayValue>
                                    <TextLink to={Paths.org(organization.slug).admin.skillPackage(skill.skillPackageId).group(skill.skillGroupId)}>
                                        {skill.skillGroup.name}
                                    </TextLink>
                                </DisplayValue>
                            }
                        />
                        <ToruGridRow
                            label="Name"
                            control={<DisplayValue>{skill.name}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Description"
                            control={
                                <DisplayValue variant="paragraph">
                                    {skill.description || <span className="text-muted-foreground">No description provided.</span>}
                                </DisplayValue>
                            }
                        />
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>{skill.status}</DisplayValue>}
                        />
                        <ToruGridFooter/>
                    </ToruGrid>
                )
                .with('Update', () => 
                    <UpdateSkillForm
                        organization={organization}
                        skillPackage={skill.skillPackage}
                        skillGroup={skill.skillGroup}
                        skill={skill}
                        onClose={() => setMode('View')}
                    />
                )
                .exhaustive()
            }
        </CardContent>
    </Card>
}


/**
 * Form to update a skill.
 * @param onClose Callback to close the form.
 * @param skill The skill to update.
 */
function UpdateSkillForm({ onClose, organization, skill, skillPackage, skillGroup }: { onClose: () => void, organization: OrganizationData, skill: SkillData, skillPackage: SkillPackageData, skillGroup: SkillGroupData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    

    const form = useForm<SkillData>({
        resolver: zodResolver(skillSchema),
        defaultValues: { ...skill}
    })

    const mutation = useMutation(trpc.skills.updateSkill.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error updating skill',
                    description: error.message,
                    variant: 'destructive',
                })
                onClose()
            }
        },
        onSuccess(result) {
            toast({
                title: 'Skill Updated',
                description: <>The skill <ObjectName>{result.name}</ObjectName> has been updated successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getSkills.queryFilter())
            queryClient.invalidateQueries(trpc.skills.getSkill.queryFilter({ skillId: result.skillId }))
            onClose()
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
            <ToruGrid mode="form">
                <FormField
                    control={form.control}
                    name="skillId"
                    render={({ field }) => <ToruGridRow
                        label="Skill ID"
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
                                <TextLink to={Paths.org(organization.slug).admin.skillPackage(skill.skillPackageId)}>
                                    {skillPackage.name}
                                </TextLink>
                            </DisplayValue>
                        }
                    />}
                />
                <FormField
                    control={form.control}
                    name="skillGroupId"
                    render={() => <ToruGridRow
                        label="Skill Group"
                        control={
                            <DisplayValue>
                                <TextLink to={Paths.org(organization.slug).admin.skillPackage(skill.skillPackageId).group(skill.skillGroupId)}>
                                    {skillGroup.name}
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
                        description="The name of the skill."
                    />}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => <ToruGridRow
                        label="Description"
                        control={<Textarea maxLength={500} {...field} />}
                        description="A brief description of the skill."
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
                        description="The current status of the skill."
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
 * Dialog component to delete a skill.
 * It requires the user to confirm by entering the skill name.
 * @param skill The skill to delete.
 * @param skillPackageId The ID of the skill package that the skill belongs to.
 */
function DeleteSkillDialog({ organization, skill }: { organization: OrganizationData, skill: SkillData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    

    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            skillId: zodNanoId8,
            skillPackageId: zodNanoId8,
            skillName: z.literal(skill.name)
        })),
        mode: 'onSubmit',
        defaultValues: { skillId: skill.skillId, skillPackageId: skill.skillPackageId, skillName: "" }
    })

    const mutation = useMutation(trpc.skills.deleteSkill.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting skill',
                description: error.message,
                variant: 'destructive'
            })
            setOpen(false)
        },
        onSuccess(result) {
            toast({
                title: 'Skill deleted',
                description: <>The skill <ObjectName>{result.name}</ObjectName> has been deleted.</>,
            })
            setOpen(false)

            queryClient.invalidateQueries(trpc.skills.getSkills.queryFilter())
            queryClient.invalidateQueries(trpc.skills.getSkill.queryFilter({ skillId: skill.skillId }))
            router.push(Paths.org(organization.slug).admin.skillPackage(skill.skillPackageId).group(skill.skillGroupId).href)
        }
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete Skill">
            <TrashIcon/>
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill</DialogTitle>
                <DialogDescription>This will remove the skill from RT+ forever (which is a really long time). </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
                        <FormItem>
                            <FormLabel>Skill</FormLabel>
                            <FormControl>
                                <DisplayValue>{skill.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="skillName"
                            render={({ field }) => <FormItem>
                                <FormLabel>Enter name</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        placeholder="Type the skill name to confirm" 
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