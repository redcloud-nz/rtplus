/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { Paragraph } from '@/components/ui/typography'

import { trpc } from '@/trpc/client'


export function Team_Skills_PackageList_Card() {

    const { data: skillPackages } = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions())

    

    return <Card>
        <CardHeader>
            <CardTitle>Available Skills</CardTitle>

            <Separator orientation='vertical'/>
            <CardExplanation>
                This card lists all available skill packages and their associated skills. You can expand each package to view the skills it contains, organized by skill groups.
            </CardExplanation>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple">
                 {skillPackages.map(pkg => (
                    <AccordionItem key={pkg.skillPackageId} value={pkg.skillPackageId}>
                        <AccordionTrigger className="px-2">{pkg.name}</AccordionTrigger>
                        <AccordionContent className="px-4">
                            {pkg.description ? <Paragraph>{pkg.description}</Paragraph> : <Paragraph className="text-muted-foreground">No description</Paragraph>}

                            <ul className="list-disc pl-4">
                                {pkg.skillGroups.map(skillGroup => (
                                    <li key={skillGroup.skillGroupId} className="mt-4">
                                        <div>{skillGroup.name}</div>
                                        <ul className="list-[circle] pl-4">
                                            {pkg.skills
                                                .filter(skill => skill.skillGroupId === skillGroup.skillGroupId)
                                                .map(skill => <li key={skill.skillId} className="my-2">
                                                    <div>{skill.name}</div>
                                                    <div className="text-muted-foreground pl-2">{skill.description}</div>
                                                </li>)
                                            }
                                        </ul>
                                    </li>
                                ))}
                            </ul>

                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
           
        </CardContent>
    </Card>
}