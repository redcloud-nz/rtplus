/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Heading, Paragraph } from '@/components/ui/typography'

import { trpc } from '@/trpc/client'


export function Team_Skills_List() {

    const { data: skillPackages } = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions())

    return <>
        {skillPackages.map(pkg => <div key={pkg.skillPackageId}>
                <Heading level={2} className="mb-3">{pkg.name}</Heading>

                {pkg.description ? <Paragraph className="mb-4">{pkg.description}</Paragraph> : null}

                { pkg.skillGroups.map(skillGroup => (
                    <div key={skillGroup.skillGroupId} className="mb-6">
                        <Heading level={4}>{skillGroup.name}</Heading>
                        {skillGroup.description ? <Paragraph className="mb-2">{skillGroup.description}</Paragraph> : null}
                        <ul className="pl-4">
                            {pkg.skills
                                .filter(skill => skill.skillGroupId === skillGroup.skillGroupId)
                                .map(skill => <li key={skill.skillId} className="my-2">
                                    <div>{skill.name}</div>
                                    <div className="text-muted-foreground pl-2">{skill.description}</div>
                                </li>)
                            }
                        </ul>
                    </div>
                ))}
            </div>
        )}
    </>
}