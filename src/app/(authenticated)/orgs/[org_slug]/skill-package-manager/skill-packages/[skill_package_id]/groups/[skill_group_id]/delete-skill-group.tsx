/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { S2_Button } from '@/components/ui/s2-button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/s2-dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData, OrganizationId } from '@/lib/schemas/organization'
import { SkillGroupData, SkillGroupId } from '@/lib/schemas/skill-group'
import { SkillPackageId } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




export function SkillPackageManagerModule_DeleteSkillGroup_Dialog({ organization, skillGroup, ...props }: Omit<ComponentProps<typeof Dialog>, 'children'> & { organization: OrganizationData, skillGroup: SkillGroupData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm({
        resolver: zodResolver(z.object({
            orgId: OrganizationId.schema,
            skillPackageId: SkillPackageId.schema,
            skillGroupId: SkillGroupId.schema,
            skillGroupName: z.literal(skillGroup.name)
        })),
        defaultValues: { orgId: organization.orgId, skillPackageId: skillGroup.skillPackageId, skillGroupId: skillGroup.skillGroupId, skillGroupName: "" }
    })

    const mutation = useMutation(trpc.skills.deleteGroup.mutationOptions({
        onMutate() {
            props.onOpenChange?.(false)
        },
        onError(error) {
            toast({
                title: 'Error deleting skill group',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess() {
            toast({
                title: 'Skill group deleted',
                description: <>The skill group <ObjectName>{skillGroup.name}</ObjectName> has been deleted.</>,
            })
            
            router.push(Paths.org(organization.slug).skillPackageManager.skillPackage(skillGroup.skillPackageId).href)

            queryClient.invalidateQueries(trpc.skills.getGroups.queryFilter({ skillPackageId: skillGroup.skillPackageId }))
        }
    }))

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Group</DialogTitle>
                <DialogDescription>
                    Please confirm that you want to delete the skill group <ObjectName>{skillGroup.name}</ObjectName>. This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                <FieldGroup>
                    <Controller
                        name="skillGroupName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field orientation="responsive">
                                <FieldContent>
                                    <FieldLabel htmlFor='delete-skill-group-confirm-name'>Group Name</FieldLabel>
                                    <FieldDescription>
                                        Retype the skill group name.
                                    </FieldDescription>
                                    { fieldState.error && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <Input 
                                    {...field} 
                                    id="delete-skill-group-confirm-name"
                                    aria-invalid={fieldState.invalid}
                                    className="min-w-1/2"
                                />
                            </Field>
                        )}
                    />
                    <Field orientation="horizontal">
                        <S2_Button 
                            type="submit" 
                            variant="destructive"
                            disabled={mutation.isPending}
                        >
                            { mutation.isPending ? <><Spinner /> Deleting...</> : 'Delete' }
                            
                        </S2_Button>
                        <DialogClose asChild>
                            <S2_Button variant="outline">Cancel</S2_Button>
                        </DialogClose>
                    </Field>
                </FieldGroup>
            </form>
        </DialogContent>
    </Dialog>
}