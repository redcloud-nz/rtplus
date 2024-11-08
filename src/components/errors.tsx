
import { AppPage, AppPageProps } from '@/components/app-page'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'

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

export function NotImplemented({ className, ...props }: AppPageProps) {

    return <AppPage className={cn("flex flex-col items-center justify-center", className)} {...props}>
        <main className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">501</div>
            <div className="font-semibold text-zinc-800">Not Implemented</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                This feature has not yet been implemented.
            </p>
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