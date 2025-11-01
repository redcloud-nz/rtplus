/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { CheckCheckIcon, CheckIcon, SlashIcon, SquarePenIcon, XIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { entries } from 'remeda'
import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { DateRangePicker } from '@/components/controls/date-range-picker'
import { SkillSelectContent } from '@/components/controls/skill-select'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { CompetenceLevelTerms } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { useSuspenseQueries } from '@tanstack/react-query'
import { trpc } from '@/trpc/client'


interface FiltersProps {
    organization: OrganizationData
}

const filtersSchema = z.object({
    assessorId: z.string().optional(),
    assesseeId: z.string().optional(),
    skillId: z.string().optional(),
    result: z.string().optional(),
    dateRange: z.object({
        from: z.string().date().optional(),
        to: z.string().date().optional(),
    }).optional(),
    status: z.enum(['Draft', 'Include', 'Exclude']).optional(),
})

export function SkillCheckFilters({ organization }: FiltersProps) {

    const [
        { data: personnel }, { data: skillPackages }
    ] = useSuspenseQueries({
        queries: [
            trpc.personnel.getPersonnel.queryOptions({ orgId: organization.orgId }),
            trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }),
        ]
    })



    const form = useForm<z.infer<typeof filtersSchema>>({
        resolver: zodResolver(filtersSchema),
        defaultValues: {},
    })

    const handleSubmit = form.handleSubmit(data => {
        console.log("Filters form submitted", data)

        const queryParams = new URLSearchParams()
        if(data.assesseeId) queryParams.append('assesseeId', data.assesseeId)
        if(data.assessorId) queryParams.append('assessorId', data.assessorId)
        if(data.skillId) queryParams.append('skillId', data.skillId)
        if(data.result) queryParams.append('result', data.result)
        if(data.dateRange) {
            if(data.dateRange.from) queryParams.append('from', data.dateRange.from)
            if(data.dateRange.to) queryParams.append('to', data.dateRange.to)
        }
        if(data.status) queryParams.append('status', data.status)

        
    })

    return <S2_Card className="mt-2">
        <S2_CardHeader>
            <S2_CardTitle>
                Filters
            </S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="skill-check-filters" onSubmit={handleSubmit}>
                <FieldGroup>
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                        <Controller
                            name="assesseeId"
                            control={form.control}
                            render={({ field }) => <Field>
                                <FieldLabel>Assessee</FieldLabel>
                                <div className="flex items-center">
                                    <S2_Select value={field.value ?? ''} onValueChange={newValue => field.onChange(newValue == '' ? undefined : newValue)}>
                                        <S2_SelectTrigger className="grow-1">
                                            <S2_SelectValue placeholder="Filter by Assessee"/>
                                        </S2_SelectTrigger>
                                        <S2_SelectContent>
                                            {personnel.map(assessee => 
                                                <S2_SelectItem key={assessee.personId} value={assessee.personId}>
                                                    {assessee.name}
                                                </S2_SelectItem>
                                            )}
                                        </S2_SelectContent>
                                    </S2_Select>
                                    { field.value
                                        ? <Tooltip>
                                            <TooltipTrigger asChild>
                                                <S2_Button variant="ghost" size="icon" onClick={() => field.onChange(undefined)}>
                                                    <XIcon/><span className="sr-only">Clear assessee filter</span>
                                                </S2_Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Clear assessee filter
                                            </TooltipContent>
                                        </Tooltip>
                                        : <div className="size-9"/>
                                    }
                                </div>
                            </Field>}
                        />

                        <Controller
                            name="assessorId"
                            control={form.control}
                            render={({ field }) => <Field>
                                <FieldLabel>Assessor</FieldLabel>
                                <div className="flex items-center">
                                    <S2_Select value={field.value ?? ''} onValueChange={newValue => field.onChange(newValue == '' ? undefined : newValue)}>
                                        <S2_SelectTrigger className="grow-1">
                                            <S2_SelectValue placeholder="Filter by Assessor"/>
                                            
                                        </S2_SelectTrigger>
                                        <S2_SelectContent>
                                            {personnel.map(assessor => 
                                                <S2_SelectItem key={assessor.personId} value={assessor.personId}>
                                                    {assessor.name}
                                                </S2_SelectItem>
                                            )}
                                        </S2_SelectContent>
                                    </S2_Select>
                                    { field.value
                                        ? <Tooltip>
                                            <TooltipTrigger asChild>
                                                <S2_Button variant="ghost" size="icon" onClick={() => field.onChange(undefined)}>
                                                    <XIcon/><span className="sr-only">Clear assessor filter</span>
                                                </S2_Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Clear assessor filter
                                            </TooltipContent>
                                        </Tooltip>
                                        : <div className="size-9"/>
                                    }
                                </div>
                            
                            </Field>}
                        />

                        <Controller
                            name="skillId"
                            control={form.control}
                            render={({ field }) => <Field>
                                <FieldLabel>Skill</FieldLabel>
                                <div className="flex items-center">
                                    <S2_Select value={field.value ?? ''} onValueChange={newValue => field.onChange(newValue == '' ? undefined : newValue)}>
                                        <S2_SelectTrigger className="grow-1">
                                            <S2_SelectValue placeholder="Filter by Skill"/>
                                        </S2_SelectTrigger>
                                        <SkillSelectContent skillPackages={skillPackages} />
                                    </S2_Select>
                                    { field.value 
                                        ? <Tooltip>
                                            <TooltipTrigger asChild>
                                                <S2_Button variant="ghost" size="icon" onClick={() => field.onChange(undefined)}>
                                                    <XIcon/><span className="sr-only">Clear skill filter</span>
                                                </S2_Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Clear skill filter
                                            </TooltipContent>
                                        </Tooltip>
                                        : <div className="size-9"/>
                                    }
                                </div>
                            
                            </Field>}
                        />

                        <Controller
                            name="result"
                            control={form.control}
                            render={({ field }) => <Field>
                                <FieldLabel>Result</FieldLabel>
                                <div className="flex items-center">
                                    <S2_Select value={field.value ?? ''} onValueChange={newValue => field.onChange(newValue == '' ? undefined : newValue)}>
                                        <S2_SelectTrigger className="grow-1">
                                            <S2_SelectValue placeholder="Filter by Result"/>
                                        </S2_SelectTrigger>
                                        <S2_SelectContent>
                                            {entries(CompetenceLevelTerms).map(([level, term]) => 
                                                <S2_SelectItem key={level} value={level}>
                                                    {level == 'NotAssessed' && <div className="size-3"/>}
                                                    {level == 'NotTaught' && <SlashIcon className="size-4 text-gray-600/50"/>}
                                                    {level == 'NotCompetent' && <XIcon className="size-4 text-red-600/50"/>}
                                                    {level == 'Competent' && <CheckIcon className="size-4 text-green-600/50"/>}
                                                    {level == 'HighlyConfident' && <CheckCheckIcon className="size-4 text-blue-600/50"/>}
                                                    <span>{term}</span>
                                                </S2_SelectItem>
                                            )}
                                        </S2_SelectContent>
                                    </S2_Select>
                                    { field.value
                                        ? <Tooltip>
                                            <TooltipTrigger asChild>
                                                <S2_Button variant="ghost" size="icon" onClick={() => field.onChange(undefined)}>
                                                    <XIcon/><span className="sr-only">Clear result filter</span>
                                                </S2_Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Clear result filter
                                            </TooltipContent>
                                        </Tooltip>
                                        : <div className="size-9"/>
                                    }
                                </div>
                            </Field>
                        }/>
                        <Controller
                            name="dateRange"
                            control={form.control}
                            render={({ field }) => <Field>
                                <FieldLabel>Date Range</FieldLabel>
                                <div className="flex items-center">
                                    <DateRangePicker 
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="grow-1"
                                    />
                                    {field.value
                                    ? <Tooltip>
                                        <TooltipTrigger asChild>
                                            <S2_Button variant="ghost" size="icon" onClick={() => field.onChange(undefined)}>
                                                <XIcon/><span className="sr-only">Clear date filter</span>
                                            </S2_Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Clear date filter
                                        </TooltipContent>
                                    </Tooltip>
                                    : <div className="size-9"/>}
                                </div>
                                
                            </Field>}
                        />
                        <Controller
                            name="status"
                            control={form.control}
                            render={({ field }) => <Field>
                                <FieldLabel>Status</FieldLabel>
                                <div className="flex items-center">
                                    <S2_Select>
                                        <S2_SelectTrigger className="grow-1">
                                            <S2_SelectValue placeholder="Filter by Status"/>
                                        </S2_SelectTrigger>
                                        <S2_SelectContent>
                                            <S2_SelectItem value="Draft"><SquarePenIcon className="size-4"/> <span>Draft</span></S2_SelectItem>
                                            <S2_SelectItem value="Include"><CheckIcon className="size-4"/> Include</S2_SelectItem>
                                            <S2_SelectItem value="Exclude"><XIcon className="size-4"/> Exclude</S2_SelectItem>
                                        </S2_SelectContent>
                                    </S2_Select>
                                    { field.value
                                        ? <Tooltip>
                                            <TooltipTrigger asChild>
                                                <S2_Button variant="ghost" size="icon" onClick={() => field.onChange(undefined)}>
                                                    <XIcon/><span className="sr-only">Clear status filter</span>
                                                </S2_Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Clear status filter
                                            </TooltipContent>
                                        </Tooltip>
                                        : <div className="size-9"/>
                                    }
                                </div>
                                
                            </Field>}
                        />
                    </FieldGroup>

                    <FieldSeparator/>

                    <Field orientation="horizontal">
                        <S2_Button type="submit" form="skill-check-filters">
                            Apply Filters
                        </S2_Button>
                        <S2_Button variant="outline" className="mr-2" onClick={() => form.reset()}>
                            Clear All
                        </S2_Button>
                    </Field>
                </FieldGroup>
           </form>
        </S2_CardContent>
    </S2_Card>
}