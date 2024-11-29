'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'

import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'
import * as Paths from '@/paths'



export default function AssessmentEditLayout({ children, params }: { children: React.ReactNode, params: { assessmentId: string  }}) {

    return <AppPage 
        label={params.assessmentId}
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies }, 
            { label: "Assessments", href: Paths.competencyAssessments },
        ]}
    >
        <PageHeader>
            <PageTitle>Competency Assessment</PageTitle>
            
        </PageHeader>
        <Navigation assessmentId={params.assessmentId}/>
        {children}
        </AppPage>
}

interface NavigationProps {
    assessmentId: string
}

function Navigation({ assessmentId }: NavigationProps) {
    const pathname = usePathname()

    const steps = [
        { id: 'edit', label: "Basic", tooltip: "Define the assessment", href: Paths.competencyAssessmentEdit(assessmentId) },
        { id: 'skills',label: "Skills", tooltip: "Select skills to assess", href: Paths.competencyAssessmentSkills(assessmentId) },
        { id: 'personnel', label: "Personnel", tooltip: "Select personnel to assess", href: Paths.competencyAssessmentPersonnel(assessmentId) },
        { id: 'assess', label: "Assess", tooltip: "Record assessments", href: Paths.competencyAssessmentAssess(assessmentId) },
    ]

    return <nav className="">
        <ol className="flex flex-wrap gap-1">
            {steps.map((step, i) => {
                const active = pathname == step.href
                return <li key={i} className="grow select-none" style={{ 'zIndex': 10-i }}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            { active
                                ? <a className={cn(
                                    'block relative text-center text-sm font-semibold py-1',
                                    'bg-green-500 text-gray-50',
                                )}>
                                    
                                    <div className="hidden sm:block absolute rotate-45 bg-inherit top-1 -right-2.5 w-5 h-5 shadow-[2px_-2px_0_1px_#fff]"></div>
                                    <div className="px-2">{step.label}</div>
                                </a>
                                : <Link 
                                className={cn(
                                    'block relative text-center text-sm font-semibold py-1',
                                    'bg-slate-100 hover:bg-slate-200',
                                )}
                                href={step.href}
                            >
                                
                                <div className="hidden sm:block absolute scale-[.95] rotate-45 bg-inherit top-1 -right-2.5 w-5 h-5 shadow-[2px_-2px_0_1px_#fff]"></div>
                                <div className="px-2">{step.label}</div>
                            </Link>
                            }
                            
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{active ? "Save Now" : step.tooltip}</TooltipContent>
                    </Tooltip>
                </li>
            })}
            <li className="grow select-none">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <a 
                        className={cn(
                            'block relative text-sm text-center font-semibold py-1',
                            'bg-gray-500 hover:bg-gray-600 text-gray-50'
                        )}
                    >
                        <div className="px-4">Done</div>
                    </a>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Exit</TooltipContent>
                </Tooltip>
            </li>
        </ol>
    </nav>
}