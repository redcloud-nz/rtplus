/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'


import { useOrganization } from '@clerk/nextjs'


import { Show } from '@/components/show'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Skeleton } from '@/components/ui/skeleton'

import * as Paths from '@/paths'


export function NavOrganization() {

    const { isLoaded, organization } = useOrganization()
    

    return <div className="h-8"> 
        <Show 
            when={isLoaded && organization != null}
            fallback={<Skeleton className="h-8 w-full" />}
        >
            <Button variant="ghost" className="w-full h-8 pl-0 border-0" asChild>
                <Link href={Paths.team(organization?.slug ?? "").index} className="w-full h-full flex items-center gap-2">
                    {/* <div className="w-full flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={organization?.imageUrl} alt={organization?.name} />
                            <AvatarFallback className="rounded-lg">
                                {"T"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="truncate font-semibold">{organization?.name}</div>
                    </div> */}
                    <div className="truncate font-semibold text-center">{organization?.name}</div>
                </Link>
            </Button>
        </Show>
    </div>
}
