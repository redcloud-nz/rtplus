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
import { SkillPackageData } from '@/lib/schemas/skill-package'
import { zodNanoId8 } from '@/lib/validation'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function SkillPackageManagerModule_DeletPackage_Dialog({ organization, skillPackage, ...props }: Omit<ComponentProps<typeof Dialog>, 'children'> & { organization: OrganizationData, skillPackage: SkillPackageData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm({
        resolver: zodResolver(z.object({
            orgId: OrganizationId.schema,
            skillPackageId: zodNanoId8,
            skillPackageName: z.literal(skillPackage.name)
        })),
        defaultValues: { orgId: organization.orgId, skillPackageId: skillPackage.skillPackageId, skillPackageName: "" }
    })

    const mutation = useMutation(trpc.skills.deletePackage.mutationOptions({
        onMutate() {
            props.onOpenChange?.(false)
            
        },
        onError(error) {
            toast({
                title: 'Error deleting skill package',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess() {
            toast({
                title: 'Skill package deleted',
                description: <>The skill package <ObjectName>{skillPackage.name}</ObjectName> has been deleted.</>,
            })

            router.push(Paths.org(organization.slug).skillPackageManager.skillPackages.href)
            
            queryClient.invalidateQueries(trpc.skills.listPackages.queryFilter({ orgId: organization.orgId }))
        }
    }))

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Package</DialogTitle>
                <DialogDescription>
                    Please confirm that you want to delete the skill package <ObjectName>{skillPackage.name}</ObjectName>. This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                <FieldGroup>
                    <Controller
                        name="skillPackageName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field orientation="responsive">
                                <FieldContent>
                                    <FieldLabel htmlFor='delete-skill-package-confirm-name'>Package Name</FieldLabel>
                                    <FieldDescription>
                                        Retype the skill package name.
                                    </FieldDescription>
                                    { fieldState.error && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <Input 
                                    {...field} 
                                    id="delete-skill-package-confirm-name"
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