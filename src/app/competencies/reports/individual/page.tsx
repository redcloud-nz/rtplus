'use client'

import { format, subDays } from 'date-fns'
import _ from 'lodash'
import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { usePersonnelQuery } from '@/lib/api/personnel'
import { useSkillPackagesQuery } from '@/lib/api/skills'

import * as Paths from '@/paths'


const Statuses = ['', 'Highly Confident', 'Competent', 'Competent', 'Competent', 'Not Competent', 'Not Competent', 'Not taught']


export default function IndividualReportPage() {

    const skillPackagesQuery = useSkillPackagesQuery()
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
        { (skillPackagesQuery.isPending || personnelQuery.isPending) ? <div className="flex flex-col items-stretch gap-2">
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
                <Skeleton className="h-8"/>
        </div>: null}
        { (skillPackagesQuery.isSuccess && personnelQuery.isSuccess) ? <Accordion type="single" collapsible>
            {skillPackagesQuery.data.map(skillPackage => {
                
                const skillCount = skillPackage.skills.length
                const selectedCount = _.random(0, skillCount)

                return <AccordionItem key={skillPackage.id} value={skillPackage.id}>
                    <AccordionTrigger>
                        <div className="flex-grow text-left">{skillPackage.name}</div>
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
                                                const status = Statuses[_.random(0, Statuses.length-1)]
                                                const date = subDays(new Date(), _.random(0, 400))
                                                const assessor = personnelQuery.data[_.random(0, personnelQuery.data.length-1)]

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
        </Accordion> : null}
    </AppPage>
}