/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { formatDistance, isBefore, subDays } from 'date-fns'
import { CheckIcon, XIcon } from 'lucide-react'
import { Fragment, useMemo } from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { createRandomValueGenerator, randomDate } from '@/lib/generate-values'
import { CompetenceLevel, CompetenceLevelTerms } from '@/lib/schemas/skill-check'
import { useTRPC } from '@/trpc/client'
import { ATable, ATableCell, ATableSectionContent, ATableHead, ATableHeadRow, ATableSection, ATableRow, ATableTrigger, ATableSectionHeader, ATableBody, ATableHeadCell } from '@/components/ui/accordion-table'


const statusGenerator = createRandomValueGenerator<CompetenceLevel>({
    'NotAssessed': 10,
    'NotTaught': 10,
    'NotCompetent': 20,
    'Competent': 50,
    'HighlyConfident': 10
})



export function Team_Member_Competencies_Card({ personId }: { personId: string }) {
    const trpc = useTRPC()

    const skillPackagesQuery = useSuspenseQuery(trpc.skills.getTree.queryOptions())

    async function handleRefresh() {
        await skillPackagesQuery.refetch()
    }

    const skillChecks = useMemo(() => {
        return skillPackagesQuery.data.flatMap(skillPackage =>
            skillPackage.skills.map(skill => {
                const result = statusGenerator()
                const date = randomDate(subDays(new Date(), 730), new Date())

                const competent = result === 'Competent' || result === 'HighlyConfident'
                const expired = isBefore(date, subDays(new Date(), 365))

                return {
                    skillId: skill.skillId,
                    result,
                    date,
                    ok: competent && !expired,
                    competent,
                    expired
                }
            })
        )
    }, [skillPackagesQuery.data])

    const skillPackages = useMemo(() => {
        const merged = skillPackagesQuery.data.flatMap(({ skills, skillGroups, ...skillPackage }) => ({
            ...skillPackage,
            skillGroups: skillGroups.map(skillGroup => ({
                ...skillGroup,
                skills: skills
                    .filter(skill => skill.skillGroupId === skillGroup.skillGroupId)
                    .map(skill => ({
                        ...skill,
                        check: skillChecks.find(check => check.skillId === skill.skillId)
                    }))
            }))
        }))

        return merged.map(skillPackage => {
            
            const groups = skillPackage.skillGroups.map(skillGroup => ({
                ...skillGroup,
                skills: skillGroup.skills.map(skill => ({
                    ...skill,
                })),
                okCount: skillGroup.skills.filter( skill => skill.check != null && skill.check.ok).length,
                totalCount: skillGroup.skills.length
            }))

            return {
                ...skillPackage,
                skillGroups: groups,
                okCount: groups.reduce((acc, group) => acc + group.okCount, 0),
                totalCount: groups.reduce((acc, group) => acc + group.totalCount, 0)
            }
        })


    }, [skillPackagesQuery.data])

    

    return <Card>
        <CardHeader>
            <CardTitle>Competencies</CardTitle>
            <CardActions>
                <RefreshButton onClick={handleRefresh} />
                <Separator orientation="vertical" />
                <CardExplanation>
                    This card displays the competencies for the team member.
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            <ATable className="grid-cols-[1fr_1fr_60px_1fr_40px]">
                <ATableHead>
                    <ATableHeadRow>
                        <ATableHeadCell>Package / Group</ATableHeadCell>
                        <ATableHeadCell>Skill</ATableHeadCell>
                        <ATableHeadCell className="text-center">Status</ATableHeadCell>
                        <ATableHeadCell>Reason</ATableHeadCell>
                    </ATableHeadRow>
                </ATableHead>
                <ATableBody type="multiple">
                    {skillPackages.map(skillPackage => <Fragment key={skillPackage.skillPackageId}>
                        <ATableRow>
                            <ATableCell className="col-span-2">{skillPackage.name}</ATableCell>
                        </ATableRow>
                        {skillPackage.skillGroups.map(skillGroup => {
                            return <ATableSection key={skillGroup.skillGroupId} value={skillGroup.skillGroupId}>
                                <ATableSectionHeader>
                                    <ATableCell className="pl-8 col-span-2">{skillGroup.name}</ATableCell>
                                    <ATableCell className="text-center">{skillGroup.okCount} / {skillGroup.skills.length}</ATableCell>
                                    <ATableCell></ATableCell>
                                    <ATableCell className="p-0">
                                        <ATableTrigger />
                                    </ATableCell>
                                </ATableSectionHeader>
                                <ATableSectionContent>
                                    {skillGroup.skills.map(skill => <ATableRow key={skill.skillId}>
                                        <ATableCell></ATableCell>
                                        <ATableCell>{skill.name}</ATableCell>
                                        <ATableCell className="flex justify-center">
                                            <div>{skill.check?.ok ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-red-500" />}</div>
                                        </ATableCell>
                                        <ATableCell>
                                            {match(skill.check)
                                                .with(undefined, () => CompetenceLevelTerms['NotAssessed'])
                                                .with({ competent: false }, (check) => CompetenceLevelTerms[check.result])
                                                .with({ competent: true, expired: true }, (check) => `expired by ${formatDistance(new Date(check.date), subDays(new Date(), 365))}`)
                                                .with({ competent: true, expired: false }, () => <></>)
                                                .exhaustive()
                                            }
                                        </ATableCell>
                                    </ATableRow>)}
                                </ATableSectionContent>
                                
                            </ATableSection>
                        })}
                    </Fragment>)}
                </ATableBody>
            </ATable>
        </CardContent>
    </Card>
}