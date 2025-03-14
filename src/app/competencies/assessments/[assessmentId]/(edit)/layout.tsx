'use client'

import { CheckIcon, Loader2Icon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { AppPage, PageControls, PageHeader, PageTitle } from '@/components/app-page'

import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'
import * as Paths from '@/paths'

import { AssessmentContextProvider, useAssessmentContext } from '../../assessment-context'


export default function AssessmentEditLayout({ children, params }: { children: React.ReactNode, params: { assessmentId: string  }}) {

    return <AssessmentContextProvider assessmentId={params.assessmentId}>
        <AppPage 
            label="Assess"
            breadcrumbs={[
                { label: "Competencies", href: Paths.competencies.dashboard }, 
                { label: "Assessments", href: Paths.competencies.assessmentList },
            ]}
        >
            <PageHeader>
                <PageTitle>Competency Assessment</PageTitle>
                <PageControls>
                    <SavingIndicator/>
                </PageControls>
            </PageHeader>
            <Navigation assessmentId={params.assessmentId}/>
            {children}
        </AppPage>
    </AssessmentContextProvider>
    
}

interface NavigationProps {
    assessmentId: string
}

function Navigation({ assessmentId }: NavigationProps) {
    const pathname = usePathname()
    const router = useRouter()

    const context = useAssessmentContext()

    function handleSave() {
        context.save()
    }

    function handleFinished() {
        context.save()
        router.push(Paths.competencies.assessmentList)
    }

    const steps = [
        { id: 'edit', label: "Basic", tooltip: "Define the assessment", href: Paths.competencies.assessment(assessmentId).edit },
        { id: 'skills',label: "Skills", tooltip: "Select skills to assess", href: Paths.competencies.assessment(assessmentId).skills },
        { id: 'personnel', label: "Personnel", tooltip: "Select personnel to assess", href: Paths.competencies.assessment(assessmentId).personnel },
        { id: 'assess', label: "Assess", tooltip: "Record assessments", href: Paths.competencies.assessment(assessmentId).assess },
    ]

    return <nav className="">
        <ol className="flex flex-wrap gap-1">
            {steps.map((step, i) => {
                const active = pathname == step.href
                return <li key={i} className="grow select-none" style={{ 'zIndex': 10-i }}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            { active
                                ? <a 
                                    className={cn(
                                        'block relative text-center text-sm font-semibold py-1',
                                        'bg-green-500 hover:bg-green-600 text-gray-50',
                                        'hover:cursor-pointer'
                                    )}
                                    onClick={handleSave}
                                >
                                    
                                    <div className="hidden sm:block absolute rotate-45 bg-inherit top-1 -right-2.5 w-5 h-5 shadow-[2px_-2px_0_1px_#fff]"></div>
                                    <div className="px-2">{step.label}</div>
                                </a>
                                : <Link 
                                    className={cn(
                                        'block relative text-center text-sm font-semibold py-1',
                                        'bg-slate-100 hover:bg-slate-200',
                                    )}
                                    href={step.href}
                                    onClick={handleSave}
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
                            'bg-gray-500 hover:bg-gray-600 text-gray-50',
                            'hover:cursor-pointer'
                        )}
                        onClick={handleFinished}
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


function SavingIndicator() {
    const { saveStatus } = useAssessmentContext()

    return <>
        {saveStatus == 'Saving' ? <div className="flex items-center gap-2">
            <Loader2Icon className="h-6 w-6 animate-spin" />
            <span className="hidden md:inline">Saving</span>
        </div> : null}
        {saveStatus == 'Saved' ? <div className="flex items-center gap-2">
            <CheckIcon className="h-6 w-6" /> 
            <span className="hidden md:inline">Saved</span>
        </div> : null}
    </>
}