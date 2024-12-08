'use client'

import { format, subDays } from 'date-fns'
import _ from 'lodash'
import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { usePersonnelQuery } from '@/lib/api/personnel'
import { useSkillsTreeQuery } from '@/lib/api/skills'

import * as Paths from '@/paths'


const Statuses = ['', 'Highly Confident', 'Competent', 'Competent', 'Competent', 'Not Competent', 'Not Competent', 'Not taught']


export default function IndividualReportPage() {

    const skillsTreeQuery = useSkillsTreeQuery()
    const personnelQuery = usePersonnelQuery()

    return <AppPage 
        label="Individual"
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard },
            { label: "Reports", href: Paths.competencies.reportsList }
        ]}
    >
        <PageHeader>
            <PageTitle>Individual Report</PageTitle>
            <PageDescription>{`Competency report for member 'John Smith'. Generated ${format(new Date(), 'PPP')}`}</PageDescription>
        </PageHeader>
        { (skillsTreeQuery.isPending || personnelQuery.isPending) ? <div className="flex flex-col items-stretch gap-2">
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
        </div>: null}
        { (skillsTreeQuery.isSuccess && personnelQuery.isSuccess) ? <Accordion type="single" collapsible>
            {skillsTreeQuery.data.map(capability => {
                
                const skillsInCapability = capability.skillGroups.flatMap(skillGroup => skillGroup.skills)
                const skillCount = skillsInCapability.length
                const selectedCount = _.random(0, skillCount)

                return <AccordionItem key={capability.id} value={capability.id}>
                    <AccordionTrigger>
                        <div className="flex-grow text-left">{capability.name}</div>
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
                                {capability.skillGroups.map(skillGroup => {
                                    return <React.Fragment key={skillGroup.id}>
                                        <TableRow>
                                            <TableCell className="font-semibold">{skillGroup.name}</TableCell>
                                        </TableRow>
                                        
                                        {skillGroup.skills.map(skill => {
                                            const status = Statuses[_.random(0, Statuses.length-1)]
                                            const date = subDays(new Date(), _.random(0, 400))
                                            const assessor = personnelQuery.data[_.random(0, personnelQuery.data.length-1)]

                                            return <TableRow key={skill.id}>
                                                <TableCell></TableCell>
                                                <TableCell>{skill.name}</TableCell>
                                                <TableCell>{status}</TableCell>
                                                <TableCell>{status && format(date, 'yyyy-MM-dd')}</TableCell>
                                                <TableCell>{status && assessor.name}</TableCell>
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