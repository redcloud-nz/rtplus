/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useClerk } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'

import { S2_Button } from '@/components/ui/s2-button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { S2_Textarea } from '@/components/ui/s2-textarea'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'




const invitationSchema = z.object({
    emailAddresses: z.string()
        .min(1, "Please enter at least one email address")
        .transform((value) => {
            return value.split(/[\s,]+/).map(email => email.trim()).filter(email => email.length > 0)
        })
        .superRefine((emailList: string[], ctx) => {
            for(const email of emailList) {
                if(!z.email().safeParse(email).success) {
                    ctx.addIssue({
                        code: 'invalid_format',
                        message: `Invalid email address`,
                        value: email,
                        format: 'email',
                    })
                }
            }
                const invalidEmail = emailList.find((email: string) => !z.email().safeParse(email).success)
                
        }),
    role: z.enum(['org:admin', 'org:member']),
})

export function AdminModule_CreateInvitation_Form({ organization }: { organization: OrganizationData }) {

    const clerk = useClerk()
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm({
        resolver: zodResolver(invitationSchema),
        defaultValues: {
            emailAddresses: "",
            role: 'org:member' as const,
        }
    })

    const handleSubmit = form.handleSubmit(async (data) => {
        setPending(true)
        
        try {
            await clerk.organization?.inviteMembers(data)

            toast({
                title: "Invitations sent",
                description: `Invitations sent to ${data.emailAddresses.length} email address(es).`,
            })
            
            router.push(Paths.org(organization.slug).admin.invitations.href)

        } catch (error) {
            toast({
                title: "Failed to send invitations",
                description: error instanceof Error ? error.message : String(error),
                variant: "destructive",
            })
        }

        setPending(false)
    })

    const [pending, setPending] = useState(false)

    return <form id="create-invitations" onSubmit={handleSubmit}>
        <FieldGroup>
            <Controller
                name="emailAddresses"
                control={form.control}
                render={({ field, fieldState }) =>
                     <Field data-invalid={fieldState.invalid}>
                        <FieldDescription>Enter or paste one or more email addresses, separated by spaces or commas.</FieldDescription>
                        <S2_Textarea 
                            id="email-addresses"
                            placeholder="example@email.com, example2@email.com"
                            aria-invalid={fieldState.invalid}
                            {...field}
                        />
                        { fieldState.error && <FieldError errors={[fieldState.error]}/> }
                    </Field>
                }
            />
            <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) =>
                    <Field data-invalid={fieldState.invalid} orientation="responsive">
                        <FieldLabel htmlFor="role-select">Role</FieldLabel>
                        <S2_Select value={field.value} onValueChange={field.onChange}>
                            <S2_SelectTrigger aria-invalid={fieldState.invalid} className="min-w-1/2" id="role-select">
                                <S2_SelectValue placeholder="Select role" />
                            </S2_SelectTrigger>
                            <S2_SelectContent>
                                <S2_SelectItem value="org:member">Member</S2_SelectItem>
                                <S2_SelectItem value="org:admin">Admin</S2_SelectItem>
                            </S2_SelectContent>
                        </S2_Select>
                        { fieldState.error && <FieldError errors={[fieldState.error]}/> }
                    </Field>
                }
            />

           <Field orientation="horizontal">
                <S2_Button 
                    type="submit"
                    form="create-invitations"
                    disabled={pending}
                >Send Invitations</S2_Button>
                <S2_Button 
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    asChild
                >
                    <Link to={Paths.org(organization.slug).admin.invitations}>Cancel</Link>
                </S2_Button>
           </Field>
        </FieldGroup>
    </form>
}