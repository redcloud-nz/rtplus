/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import { ClockIcon, CombineIcon, ListChecksIcon, NotebookTextIcon, PocketKnifeIcon, WalletCardsIcon } from 'lucide-react'
import Image from 'next/image'


import { AppPage, AppPageContainer } from '@/components/app-page'
import { Link } from '@/components/ui/link'
import { cn } from '@/lib/utils'

import * as Paths from '@/paths'


const subApps: { title: string, href: string, icon?: typeof ClockIcon, iconForeground: string, iconBackground: string, description: string }[] = [
    {
      title: 'Availability',
      href: Paths.availability.index,
      icon: ClockIcon,
      iconForeground: 'text-teal-700',
      iconBackground: 'bg-teal-50',
      description: "Collect availabilty from your teams."
    },
    {
      title: 'Checklists',
      href: Paths.checklists.index,
      icon: ListChecksIcon,
      iconForeground: 'text-purple-700',
      iconBackground: 'bg-purple-50',
        description: "Create and manage checklists for your teams."
    },
    {
      title: 'Competencies',
      href: Paths.competencies.dashboard,
      icon: PocketKnifeIcon,
      iconForeground: 'text-sky-700',
      iconBackground: 'bg-sky-50',
      description: "Manage, assess, and report competencies for your team."
    },
    {
      title: 'Field Operations Guide',
      href: '/fog',
      icon: NotebookTextIcon,
      iconForeground: 'text-yellow-700',
      iconBackground: 'bg-yellow-50',
      description: "Digital Field Operations Guide."
    },
    {
      title: 'Reference Cards',
      href: '/cards',
      icon: WalletCardsIcon,
      iconForeground: 'text-rose-700',
      iconBackground: 'bg-rose-50',
      description: "Access the Reference Cards."
    },
    {
      title: 'D4H Unified',
      href: Paths.unified.index,
      icon: CombineIcon,
      iconForeground: 'text-indigo-700',
      iconBackground: 'bg-indigo-50',
      description: "Alternate views of the data stored in D4H Team Manager. Unified across multiple teams."
    },
]

const dataCards: { name: string, initials: string, href: string, bgColor: string }[] = [
    { name: 'Manage', initials: 'M', href: Paths.manage, bgColor: 'bg-blue-500' },
    { name: 'Teams', initials: 'T', href: Paths.teams.list, bgColor: 'bg-pink-600' },
    { name: 'Personnel', initials: 'P', href: Paths.personnel, bgColor: 'bg-purple-600' },
    { name: 'Skill Packages', initials: 'SP', href: Paths.skillPackagesList, bgColor: 'bg-yellow-500' },
]

export default function HomePage() {
    return <AppPageContainer>
        <AppPage label="">
            <div className="container mx-auto">
                <div className="flex flex-col items-center gap-4 my-4">
                    <Image
                        className="dark:invert"
                        src="/logo.svg"
                        alt="RT+ logo"
                        width={200}
                        height={100}
                        priority
                    />
                    <p>Response Team Management Tools.</p>
                </div>
                
                <ul role="list" className="container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {subApps.map((action, actionIdx) => 
                        <li key={actionIdx} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                            <div className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                                <div>
                                    <span
                                        className={cn(
                                            action.iconBackground,
                                            action.iconForeground,
                                            'inline-flex rounded-lg p-3 ring-4 ring-white',
                                        )}
                                        >
                                        { action.icon && <action.icon aria-hidden="true" className="size-6" />}
                                    </span>
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        <Link href={action.href} className="focus:outline-none">
                                            {/* Extend touch target to entire panel */}
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {action.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {action.description}
                                    </p>
                                </div>
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                                >
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="size-6">
                                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                                    </svg>
                                </span>
                            </div>
                            
                        </li>   
                    )}
                </ul>
                <ul role="list" className="container mx-auto mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    {dataCards.map((card) =>
                        <li key={card.name} className="col-span-1 flex shadow-sm rounded-md">
                            <div className={cn(card.bgColor, 'flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white')}>
                                {card.initials}
                            </div>
                            <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                                <div className="flex-1 truncate px-4 py-2 text-sm">
                                    <Link href={card.href} className="font-medium text-gray-900 hover:text-gray-600">
                                        {card.name}
                                    </Link>
                                </div>
                                {/* <div className="shrink-0 pr-2">
                                    <button
                                        type="button"
                                        className="inline-flex size-8 items-center justify-center rounded-full bg-transparent bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <span className="sr-only">Open options</span>
                                        <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                                    </button>
                                </div> */}
                            </div>
                        </li>      
                    )}
                </ul>
            </div>
        </AppPage>
    </AppPageContainer>
    
        
}

