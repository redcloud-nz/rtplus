/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { AppPageContent, AppPageContentProps } from '@/components/app-page'
import { Separator } from '@/components/ui/separator'

import { Link } from '../ui/link'

export function NotFound(props: AppPageContentProps) {

    return <AppPageContent variant="centered" {...props}>
        <main className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">404</div>
            <div className="font-semibold text-zinc-800">Not Found</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                The resource you requested was not found. Have you tried turning it off and on again?
            </p>
        </main>
        
    </AppPageContent>
}

export type NotImplementedProps = AppPageContentProps & { 
    docUrl?: string
}

export function NotImplemented({ docUrl, ...props }: NotImplementedProps) {

    return <AppPageContent variant="centered" {...props}>
        <div className="flex flex-col gap-2 justify-center items-center">
            <div className="font-semibold text-2xl text-zinc-800">501</div>
            <div className="font-semibold text-zinc-800">Not Implemented</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                This page is part of a planned feature that has not yet been implemented.
            </p>
            {docUrl ? <p>Learn more about the concept of this feature in the <Link href={docUrl}>documentation</Link>.</p> : null}
        </div>
        
    </AppPageContent>
}

export function Unauthorized({ ...props }: AppPageContentProps) {

    return <AppPageContent variant="centered" {...props}>
        <div className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">401</div>
            <div className="font-semibold text-zinc-800">Unauthorized</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                You need to be signed in to access this feature.
            </p>
        </div>
        
    </AppPageContent>
}

export function Forbidden({ ...props }: AppPageContentProps) {
    return <AppPageContent variant="centered" {...props}>
        <div className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">403</div>
            <div className="font-semibold text-zinc-800">Forbidden</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                You do not have permission to access this page.
            </p>
        </div>
        
    </AppPageContent>
}