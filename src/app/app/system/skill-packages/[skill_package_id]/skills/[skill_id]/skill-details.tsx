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
import { Checkbox } from '@/components/ui/checkbox'
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
import { SkillFormData, skillFormSchema } from '@/lib/forms/skill'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { SkillWithPackageAndGroup, useTRPC } from '@/trpc/client'




/**
 * Card that displays the details of a skill and allows the user to edit or delete it.
 * @param skillId The ID of the skill to display.
 * @param skillPackageId The ID of the skill package that the skill belongs to.
 */
export function SkillDetailsCard({ skillId, skillPackageId }: { skillId: string, skillPackageId: string }) {

    const trpc = useTRPC()
    const { data: skill } = useSuspenseQuery(trpc.skills.byId.queryOptions({ skillId, skillPackageId }))

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
                <DeleteSkillDialog skill={skill} skillPackageId={skillPackageId} />

                <Separator orientation="vertical"/>

                <CardExplanation>
                    This skill defines a specific competency that can be assessed within a skill group. 
                    Skills can be marked as optional or required and have different assessment frequencies.
                    <br/>
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
                            control={<DisplayValue>{skill.id}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Skill Package"
                            control={
                                <DisplayValue>
                                    <TextLink href={Paths.system.skillPackage(skill.skillPackageId).index}>
                                        {skill.skillPackage.name}
                                    </TextLink>
                                </DisplayValue>
                            }
                        />
                        <ToruGridRow
                            label="Skill Group"
                            control={
                                <DisplayValue>
                                    <TextLink href={Paths.system.skillPackage(skill.skillPackageId).group(skill.skillGroupId).index}>
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
                            label="Frequency"
                            control={<DisplayValue>{skill.frequency}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Optional"
                            control={<DisplayValue>{skill.optional ? 'Yes' : 'No'}</DisplayValue>}
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
function UpdateSkillForm({ onClose, skill }: { onClose: () => void, skill: SkillWithPackageAndGroup }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<SkillFormData>({
        resolver: zodResolver(skillFormSchema),
        defaultValues: {
            skillId: skill.id,
            skillGroupId: skill.skillGroupId,
            skillPackageId: skill.skillPackageId,
            name: skill.name,
            description: skill.description,
            frequency: skill.frequency,
            optional: skill.optional,
            status: skill.status
        }
    })

    const mutation = useMutation(trpc.skills.sys_update.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillFormData, { message: error.shape.message })
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

            queryClient.invalidateQueries(trpc.skills.all.queryFilter())
            queryClient.invalidateQueries(trpc.skills.byId.queryFilter({ skillId: result.id }))
            queryClient.invalidateQueries(trpc.skills.bySkillGroupId.queryFilter({ skillGroupId: result.skillGroupId }))
            onClose()
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
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
                    render={({ field }) => <ToruGridRow
                        label="Skill Package"
                        control={
                            <DisplayValue>
                                <TextLink href={Paths.system.skillPackage(skill.skillPackageId).index}>
                                    {skill.skillPackage.name}
                                </TextLink>
                            </DisplayValue>
                        }
                    />}
                />
                <FormField
                    control={form.control}
                    name="skillGroupId"
                    render={({ field }) => <ToruGridRow
                        label="Skill Group"
                        control={
                            <DisplayValue>
                                <TextLink href={Paths.system.skillPackage(skill.skillPackageId).group(skill.skillGroupId).index}>
                                    {skill.skillGroup.name}
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
                    name="frequency"
                    render={({ field }) => <ToruGridRow
                        label="Frequency"
                        control={<Input maxLength={50} {...field} />}
                        description="How often this skill should be assessed."
                    />}
                />
                <FormField
                    control={form.control}
                    name="optional"
                    render={({ field }) => <ToruGridRow
                        label="Optional"
                        control={
                            <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        }
                        description="Whether this skill is optional for assessment."
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
function DeleteSkillDialog({ skill, skillPackageId }: { skill: SkillWithPackageAndGroup, skillPackageId: string }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            skillId: zodNanoId8,
            skillPackageId: zodNanoId8,
            skillName: z.literal(skill.name)
        })),
        mode: 'onSubmit',
        defaultValues: { skillId: skill.id, skillPackageId, skillName: "" }
    })

    const mutation = useMutation(trpc.skills.sys_delete.mutationOptions({
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

            queryClient.invalidateQueries(trpc.skills.all.queryFilter())
            queryClient.invalidateQueries(trpc.skills.byId.queryFilter({ skillId: skill.id }))
            queryClient.invalidateQueries(trpc.skills.bySkillGroupId.queryFilter({ skillGroupId: skill.skillGroupId }))
            router.push(Paths.system.skillPackage(skillPackageId).group(skill.skillGroupId).index)
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
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
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