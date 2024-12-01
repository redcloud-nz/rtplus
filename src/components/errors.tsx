
import { AppPage, AppPageProps } from '@/components/app-page'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'
import { Link } from './ui/link'

export function NotFound() {

    return <AppPage className="flex flex-col items-center justify-center" label="Not Found">
        <main className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">404</div>
            <div className="font-semibold text-zinc-800">Not Found</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                The resource you requested was not found.
            </p>
        </main>
        
    </AppPage>
}

export type NotImplementedProps = AppPageProps & { 
    docUrl?: string
}

export function NotImplemented({ className, docUrl, ...props }: NotImplementedProps) {

    return <AppPage className={cn("flex flex-col items-center justify-center", className)} {...props}>
        <main className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">501</div>
            <div className="font-semibold text-zinc-800">Not Implemented</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                This page is part of a planned feature that has not yet been implemented.
            </p>
            {docUrl ? <p>Learni more about the concept of this feature in the <Link href={docUrl}>documentation</Link>.</p> : null}
        </main>
        
    </AppPage>
}

export function Unauthorized({ className, ...props }: AppPageProps) {

    return <AppPage className={cn("flex flex-col items-center justify-center", className)} {...props}>
        <main className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">401</div>
            <div className="font-semibold text-zinc-800">Unauthorized</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                You need to be signed in to access this feature.
            </p>
        </main>
        
    </AppPage>
}