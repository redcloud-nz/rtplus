/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import React from 'react'
import * as R from 'remeda'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'


import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'


import { trpc } from '@/trpc/client'


export default function TeamSkillsReport() {

    const skillPackagesQuery = trpc.skillPackages.all.useQuery()

    return <>
        { skillPackagesQuery.isLoading && <div className="flex flex-col items-stretch gap-2">
            <div className="h-8 bg-gray-200 animate-pulse rounded"/>
            <div className="h-8 bg-gray-200 animate-pulse rounded"/>
        </div> }
        { skillPackagesQuery.isSuccess && <Accordion type="single" collapsible>
            {skillPackagesQuery.data.map(skillPackage => {

                return <AccordionItem key={skillPackage.id} value={skillPackage.id}>
                    <AccordionTrigger>
                        <div className="grow text-left">{skillPackage.name}</div>
                        {/* <div className="text-xs text-muted-foreground mr-4">{selectedCount} of 25 members current</div> */}
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table border>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell>Group</TableHeadCell>
                                    <TableHeadCell>Skill</TableHeadCell>
                                    <TableHeadCell>Percentage</TableHeadCell>
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
                                                return <TableRow key={skill.id}>
                                                    <TableCell></TableCell>
                                                    <TableCell>{skill.name}</TableCell>
                                                    <TableCell>{R.randomInteger(0, 100)}%</TableCell>
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