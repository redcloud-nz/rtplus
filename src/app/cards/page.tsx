/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /cards
 */

import { Metadata } from 'next'
import Link, { LinkProps } from 'next/link'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'
import { Heading } from '@/components/ui/typography'

import { VehicleList } from '@/data/vehicles'

import { cn } from '@/lib/utils'


export const metadata: Metadata = { title: "Cards | RT+" }

export default async function ReferenceCardsPage() {

    return <AppPage
        label="Reference Cards"
    >
        <PageTitle>Reference Cards</PageTitle>
        <PageDescription>
            A collection of quick reference cards.
        </PageDescription>
        <Heading level={2}>Vehicles</Heading>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {VehicleList.map(vehicle => 
                <ReferenceCardButton
                    key={vehicle.plate}
                    cardType="Vehicle"
                    title={vehicle.plate}
                    subtitle={vehicle.name}
                    href={`/cards/vehicles/${vehicle.plate}`}
                />
            )}
        </div>
    </AppPage>
}


type ReferenceCardButtonProps = Omit<LinkProps, 'children'> & {
    className?: string
    title: string
    subtitle: string
    cardType: string
}

function ReferenceCardButton({ className, subtitle, title, cardType, ...props }: ReferenceCardButtonProps) {

    return <Link className={cn(
        'flex flex-col p-2 rounded-md gap-1',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground', 
        className
    )} {...props}>
        <div className="text-xs">{cardType}</div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-zinc-600">{subtitle}</div>
    </Link>
}