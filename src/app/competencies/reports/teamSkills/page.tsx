'use client'

import { format } from 'date-fns'
import _ from 'lodash'
import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { useSkillsTreeQuery } from '@/lib/api/skills'

import * as Paths from '@/paths'


export default function TeamSkillsReportPage() {

    const skillsTreeQuery = useSkillsTreeQuery()

    return <AppPage 
        label="Team Skills"
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard },
            { label: "Reports", href: Paths.competencies.reportsList }
        ]}
    >
        <PageHeader>
            <PageTitle>Team Skills Report</PageTitle>
            <PageDescription>{`Skills report for Team NZ-RT13. Generated ${format(new Date(), 'PPP')}`}</PageDescription>
        </PageHeader>
        { (skillsTreeQuery.isPending) ? <div className="flex flex-col items-stretch gap-2">
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
        </div>: null}
        { (skillsTreeQuery.isSuccess) ? <Accordion type="single" collapsible>
            {skillsTreeQuery.data.map(capability => {

                return <AccordionItem key={capability.id} value={capability.id}>
                    <AccordionTrigger>
                        <div className="flex-grow text-left">{capability.name}</div>
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
                                {capability.skillGroups.map(skillGroup => {
                                    return <React.Fragment key={skillGroup.id}>
                                        <TableRow>
                                            <TableCell className="font-semibold">{skillGroup.name}</TableCell>
                                        </TableRow>
                                        
                                        {skillGroup.skills.map(skill => {
                                           

                                            return <TableRow key={skill.id}>
                                                <TableCell></TableCell>
                                                <TableCell>{skill.name}</TableCell>
                                                <TableCell>{_.random(0, 100)}%</TableCell>
                                            </TableRow>
                                        })}
                                    </React.Fragment>
                                })}
                            </TableBody>
                        </Table>
                        <ul className="pl-2">
                            
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            })}
        </Accordion> : null}
    </AppPage>
}