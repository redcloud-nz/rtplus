/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'




export function AccessCard(props: { personId: string}) {


    return <Card>
            <CardHeader>
                <CardTitle>Access</CardTitle>
                {/* <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={Paths.system.personnel.person(props.personId).teamMemberships.create}>
                                <PlusIcon size={48}/>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Add Team Membership
                    </TooltipContent>
                </Tooltip> */}
                {/* <Protect permission="system:write">
                    <Button variant="ghost"><PlusIcon/></Button>
                </Protect> */}
            
            </CardHeader>
            <CardBody>
                
            </CardBody>
        </Card>
}