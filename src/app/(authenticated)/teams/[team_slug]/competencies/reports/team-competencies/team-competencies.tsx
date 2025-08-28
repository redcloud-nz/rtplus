/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { addYears, formatDate, isBefore, subMonths, subYears } from 'date-fns'
import { CheckIcon, ClockAlertIcon, SettingsIcon, XIcon } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { randomInteger, sumBy } from 'remeda'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { SkillCheckGeneratorConfig_Card, SkillCheckGeneratorConfigData } from '@/components/cards/skill-check-generator-config'
import { ATable, ATableCell, ATableSectionContent, ATableSection, ATableRow, ATableTrigger, ATableSectionHeader, ATableBody, ATableHead, ATableHeadRow, ATableHeadCell } from '@/components/ui/accordion-table'
import { Alert } from '@/components/ui/alert'
import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubIssueLink } from '@/components/ui/link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

import { createRandomDateGenerator, createRandomValueGenerator } from '@/lib/generate-values'
import { CompetenceLevel } from '@/lib/competencies'
import { useTRPC } from '@/trpc/client'



export function Team_Competencies_Card({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const skillPackagesQuery = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions())
    const teamMembersQuery = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId }))

    async function handleRefresh() {
        await skillPackagesQuery.refetch()
        await teamMembersQuery.refetch()
    }

    const [generatorConfigOpen, setGeneratorConfigOpen] = useState(false)
    const [generatorConfig, setGeneratorConfig] = useState<SkillCheckGeneratorConfigData>({
        statusWeights: {
            'NotAssessed': 10,
            'NotTaught': 10,
            'NotCompetent': 20,
            'Competent': 50,
            'HighlyConfident': 10
        },
        dateWeights: {
            'Expired': 20,
            'RecentlyExpired': 10,
            'NearlyExpired': 10,
            'OK': 60
        }
    })

    const skillChecks = useMemo(() => {
        const now = new Date()

        const statusGenerator = createRandomValueGenerator<CompetenceLevel>(generatorConfig.statusWeights)
        const dateGenerator = createRandomDateGenerator([
            { start: subMonths(now, 24), end: subMonths(now, 15), weight: generatorConfig.dateWeights.Expired },
            { start: subMonths(now, 15), end: subMonths(now, 12), weight: generatorConfig.dateWeights.RecentlyExpired },
            { start: subMonths(now, 12), end: subMonths(now, 9), weight: generatorConfig.dateWeights.NearlyExpired },
            { start: subMonths(now, 9), end: now, weight: generatorConfig.dateWeights.OK }
        ])

        return teamMembersQuery.data.flatMap(teamMember =>
            skillPackagesQuery.data.flatMap(skillPackage =>
                skillPackage.skills.map(skill => {
                    const result = statusGenerator()
                    const date = dateGenerator()

                    const competent = result === 'Competent' || result === 'HighlyConfident'
                    const expired = isBefore(date, subYears(now, 1))

                    if(result == 'NotAssessed') return undefined

                    return {
                        skillId: skill.skillId,
                        assesseeId: teamMember.personId,
                        assessorId: teamMembersQuery.data[randomInteger(0, teamMembersQuery.data.length - 1)].personId,
                        result,
                        date,
                        ok: competent && !expired,
                        competent,
                        expired
                    }
                })
            )
        ).filter((check): check is NonNullable<typeof check> => check !== undefined)
    }, [skillPackagesQuery.data, teamMembersQuery.data, generatorConfig])

    const skillPackages = useMemo(() => {
        return skillPackagesQuery.data.flatMap(({ skills, skillGroups, ...skillPackage }) => {
            const processedSkillGroups = skillGroups.map(skillGroup => {
                const processedSkills = skills
                    .filter(skill => skill.skillGroupId === skillGroup.skillGroupId)
                    .map(skill => {
                        const processedChecks = teamMembersQuery.data.map(teamMember =>
                            skillChecks.find(check => check.skillId == skill.skillId && check.assesseeId == teamMember.personId)
                        )
                        return {
                            ...skill,
                            checks: processedChecks,
                            aggregates: {
                                okCount: processedChecks.filter(check => check?.ok).length,
                                cellCount: processedChecks.length
                            }
                        }
                    })

                return {
                    ...skillGroup,
                    skills: processedSkills,
                    aggregates: {
                        okCount: sumBy(processedSkills, skill => skill.aggregates.okCount),
                        cellCount: sumBy(processedSkills, skill => skill.aggregates.cellCount),
                        okCountByTeamMember: teamMembersQuery.data.map((_, index) => processedSkills.filter(skill => skill.checks[index]?.ok).length),
                        skillsCount: processedSkills.length
                    }
                }
            })

            return {
                ...skillPackage,
                skillGroups: processedSkillGroups,
                aggregates: {
                    okCount: sumBy(processedSkillGroups, group => group.aggregates.okCount),
                    cellCount: sumBy(processedSkillGroups, group => group.aggregates.cellCount),
                    okCountByTeamMember: teamMembersQuery.data.map((_, index) => sumBy(processedSkillGroups, group => group.aggregates.okCountByTeamMember[index])),
                    skillsCount: sumBy(processedSkillGroups, group => group.aggregates.skillsCount)
                }
            }
        })


    }, [skillPackagesQuery.data, teamMembersQuery.data, skillChecks])

    const teamMembersMap = useMemo(() => {
        return new Map(teamMembersQuery.data.map(member => [member.personId, member]))
    }, [teamMembersQuery.data])

    const aggregates = {
        okCount: sumBy(skillPackages, group => group.aggregates.okCount),
        cellCount: sumBy(skillPackages, group => group.aggregates.cellCount),
        okCountByTeamMember: teamMembersQuery.data.map((_, index) => sumBy(skillPackages, group => group.aggregates.okCountByTeamMember[index])),
        skillsCount: sumBy(skillPackages, group => group.aggregates.skillsCount)
    }


    return <>
        <Alert severity="mockup" title="Design Mockup" 
            action={<Button variant="ghost" size="icon" onClick={() => setGeneratorConfigOpen(!generatorConfigOpen)}><SettingsIcon /></Button>}
        >
            This page is a design mockup that is implemented with randomly generated skill checks.
            <p>See <GitHubIssueLink issueNumber={15}/> for feedback or suggestions.</p>
        </Alert>
        { generatorConfigOpen && <SkillCheckGeneratorConfig_Card 
            defaultValue={generatorConfig}
            onApply={setGeneratorConfig}
            onClose={() => setGeneratorConfigOpen(false)}
        /> }
        <Card>
            <CardHeader>
                <CardTitle>Team Competencies</CardTitle>
                <CardActions>
                    <RefreshButton onClick={handleRefresh} />
                    <Separator orientation="vertical" />
                    <CardExplanation>
                        This card displays the competencies for all active team members.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent className="overflow-y-scroll">
                <ATable style={{ gridTemplateColumns: `min(25%, 320px) 75px ${teamMembersQuery.data.map(() => '60px').join(' ')} 40px` }}>
                    <ATableHead>
                        <ATableHeadRow className="h-30 hover:bg-inherit">
                            <ATableHeadCell></ATableHeadCell>
                            {teamMembersQuery.data.map(teamMember => 
                                <ATableHeadCell key={teamMember.personId}>
                                    <div className="w-30 overflow-hidden overflow-ellipsis whitespace-nowrap rotate-[-60deg] -translate-2 p-1">{teamMember.person.name}</div>
                                </ATableHeadCell>
                            )}
                            <ATableHeadCell className="self-end font-bold text-center">Overall</ATableHeadCell>
                        </ATableHeadRow>
                    </ATableHead>
                    <ATableBody type="multiple">

                        {skillPackages.map(skillPackage => <Fragment key={skillPackage.skillPackageId}>
                            <ATableRow>
                                <ATableCell className="font-bold">{skillPackage.name}</ATableCell>
                                {teamMembersQuery.data.map((teamMember, index) => 
                                    <ATableCell key={teamMember.personId} className="text-center">
                                        {toPercentage(skillPackage.aggregates.okCountByTeamMember[index], skillPackage.aggregates.skillsCount)}%
                                    </ATableCell>
                                )}
                                <ATableCell className="text-center">{toPercentage(skillPackage.aggregates.okCount, skillPackage.aggregates.cellCount)}%</ATableCell>
                            </ATableRow>

                            {skillPackage.skillGroups.map(skillGroup => {
                                return <ATableSection key={skillGroup.skillGroupId} value={skillGroup.skillGroupId}>

                                    <ATableSectionHeader>
                                        <ATableCell className="pl-4 font-semibold">{skillGroup.name}</ATableCell>
                                        {teamMembersQuery.data.map((teamMember, index) => 
                                            <ATableCell key={teamMember.personId} className="text-center">
                                                {toPercentage(skillGroup.aggregates.okCountByTeamMember[index], skillGroup.aggregates.skillsCount)}%
                                            </ATableCell>
                                        )}
                                        <ATableCell className="text-center">{toPercentage(skillGroup.aggregates.okCount, skillGroup.aggregates.cellCount)}%</ATableCell>
                                        <ATableCell className="p-0">
                                            <ATableTrigger />
                                        </ATableCell>
                                    </ATableSectionHeader>

                                    <ATableSectionContent>
                                        {skillGroup.skills.map(skill => <ATableRow key={skill.skillId}>
                                            <ATableCell className="pl-8">{skill.name}</ATableCell>
                                            {teamMembersQuery.data.map((teamMember, index) => 
                                                <ATableCell key={teamMember.personId} className="flex justify-center items-center">
                                                    {match(skill.checks[index])
                                                        .with({ competent: true, expired: false }, (check) => <Popover>
                                                            <PopoverTrigger className="p-2 data-[state=open]:border rounded-full">
                                                                <CheckIcon className="h-4 w-4 text-green-500" />
                                                            </PopoverTrigger>
                                                            <PopoverContent className="text-sm grid grid-cols-2 space-x-2">
                                                                <div className="col-span-2 text-center font-semibold">Competent</div>
                                                                <div className="text-right text-gray-500">Assessor:</div>
                                                                <div>{teamMembersMap.get(check.assessorId)?.person.name}</div>
                                                                <div className="text-right text-gray-500">Expires:</div>
                                                                <div>{formatDate(addYears(check.date, 1), 'd MMM yyyy')} </div>
                                                            </PopoverContent>
                                                        </Popover>)
                                                        .with({ competent: true, expired: true }, (check) => <Popover>
                                                            <PopoverTrigger className="p-2 data-[state=open]:border rounded-full">
                                                                <ClockAlertIcon className="h-4 w-4 text-orange-300" />
                                                            </PopoverTrigger>
                                                            <PopoverContent className="text-sm grid grid-cols-2 space-x-2">
                                                                <div className="col-span-2 text-center font-semibold">Expired</div>
                                                                <div className="text-right text-gray-500">Assessor:</div>
                                                                <div>{teamMembersMap.get(check.assessorId)?.person.name}</div>
                                                                <div className="text-right text-gray-500">Expired:</div>
                                                                <div>{formatDate(addYears(check.date, 1), 'd MMM yyyy')} </div>
                                                            </PopoverContent>
                                                        </Popover>)
                                                        .with({ result: 'NotCompetent' }, (check) => <Popover>
                                                            <PopoverTrigger className="p-2 data-[state=open]:border rounded-full">
                                                                <XIcon className="h-4 w-4 text-red-500" />
                                                            </PopoverTrigger>
                                                            <PopoverContent className="text-sm grid grid-cols-2 space-x-2">
                                                                <div className="col-span-2 text-center font-semibold">Not Competent</div>
                                                                <div className="text-right text-gray-500">Assessor:</div>
                                                                <div>{teamMembersMap.get(check.assessorId)?.person.name}</div>
                                                                <div className="text-right text-gray-500">Date:</div>
                                                                <div>{formatDate(check.date, 'd MMM yyyy')} </div>
                                                            </PopoverContent>
                                                        </Popover>)
                                                        .otherwise(() => null)
                                                    }
                                                </ATableCell>
                                            )}

                                            {/* Row Total */}
                                            <ATableCell className="text-center">{toPercentage(skill.aggregates.okCount, skill.aggregates.cellCount)}%</ATableCell>
                                            
                                        </ATableRow>)}
                                    </ATableSectionContent>
                                    
                                </ATableSection>
                            })}
                        </Fragment>)}
                        <ATableRow>
                            <ATableCell className="font-bold text-right">Total</ATableCell>
                            <ATableCell className="text-center">{toPercentage(aggregates.okCount, aggregates.cellCount)}%</ATableCell>
                            {teamMembersQuery.data.map((_, index) => 
                                <ATableCell key={index} className="text-center">{toPercentage(aggregates.okCountByTeamMember[index], aggregates.skillsCount)}%</ATableCell>
                            )}
                        </ATableRow>
                    </ATableBody>
                </ATable>
            </CardContent>
        </Card>
    </>
}


function toPercentage(value: number, total: number) {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
}