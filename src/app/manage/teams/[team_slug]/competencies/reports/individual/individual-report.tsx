/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { format, subDays } from 'date-fns'
import React from 'react'
import * as R from 'remeda'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { trpc } from '@/trpc/client'


const Statuses = ['', 'Highly Confident', 'Competent', 'Competent', 'Competent', 'Not Competent', 'Not Competent', 'Not taught']


export default function IndividualReport() {
    const skillPackagesQuery = trpc.skillPackages.all.useQuery()
    const personnelQuery = trpc.personnel.all.useQuery()

    const getRandomPerson = () => {
        if(personnelQuery.data && personnelQuery.data.length > 0) {
            return personnelQuery.data[R.randomInteger(0, personnelQuery.data.length-1)]
        } else return { name: 'Unknown' }
    }

    return <>
        { (skillPackagesQuery.isLoading || personnelQuery.isLoading) && <div className="flex flex-col items-stretch gap-2">
            <Skeleton className="h-8"/>
            <Skeleton className="h-8"/>
        </div> }
        { (skillPackagesQuery.isSuccess && personnelQuery.isSuccess) && <Accordion type="single" collapsible>
            {skillPackagesQuery.data.map(skillPackage => {
                
                const skillCount = skillPackage.skills.length
                const selectedCount = R.randomInteger(0, skillCount)

                return <AccordionItem key={skillPackage.id} value={skillPackage.id}>
                    <AccordionTrigger>
                        <div className="grow text-left">{skillPackage.name}</div>
                        <div className="text-xs text-muted-foreground mr-4">{selectedCount} of {skillCount} current</div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table border>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell>Group</TableHeadCell>
                                    <TableHeadCell>Skill</TableHeadCell>
                                    <TableHeadCell>Competency</TableHeadCell>
                                    <TableHeadCell>Date</TableHeadCell>
                                    <TableHeadCell>Assessor</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {skillPackage.skillGroups.map(skillGroup => {
                                    return <React.Fragment key={skillGroup.id}>
                                        <TableRow>
                                            <TableCell className="font-semibold">{skillGroup.name}</TableCell>
                                        </TableRow>
                                        
                                        {skillPackage.skills
                                            .filter(skill => skill.skillGroupId == skillGroup.id)
                                            .map(skill => {
                                                const status = Statuses[R.randomInteger(0, Statuses.length-1)]
                                                const date = subDays(new Date(), R.randomInteger(0, 400))
                                                const assessor = getRandomPerson()

                                                return <TableRow key={skill.id}>
                                                    <TableCell></TableCell>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{status}</TableCell>
                                                    <TableCell>{status && format(date, 'yyyy-MM-dd')}</TableCell>
                                                    <TableCell className="text-muted-foreground">{status && assessor.name}</TableCell>
                                                </TableRow>
                                            })
                                        }
                                    </React.Fragment>
                                })}
                            </TableBody>
                        </Table>
                        <ul className="pl-2">
                            
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            })}
        </Accordion>}
    </>
    
}