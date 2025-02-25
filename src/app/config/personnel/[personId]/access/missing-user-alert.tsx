/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'

import { Alert } from '@/components/ui/alert'
import { AsyncButton } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Person } from '@prisma/client'
import { trpc } from '@/trpc/client'

export function MissingUserAlert({ person }: { person: Person}) {

    const router = useRouter()
    const mutation = trpc.users.createForPerson.useMutation()

    async function handleCreateUser() {
        await mutation.mutateAsync({ personId: person.id })

        router.refresh()
    }

    return <Alert 
        title="No User Account" 
        severity="info" 
        className='max-w-xl'
        action={<Tooltip>
            <TooltipTrigger asChild>
                <AsyncButton 
                    variant="ghost"
                    label="Create"
                    pending="Creating..."
                    done="Created"
                    onClick={handleCreateUser}
                />
            </TooltipTrigger>
            <TooltipContent>
                Create a user account for {person.name}.
            </TooltipContent>
        </Tooltip>}
    >
        {person.name} does not have a user account. 
    </Alert>
}
