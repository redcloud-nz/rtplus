
import { AppPage, AppPageProps } from '@/components/app-page'
import { Separator } from '@/components/ui/separator'

import { Link } from './ui/link'

export function NotFound({ label = "Not Found", ...props}: Omit<AppPageProps, 'label'> & { label?: string }) {

    return <AppPage variant="centered" label={label} {...props}>
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

export function NotImplemented({ docUrl, ...props }: NotImplementedProps) {

    return <AppPage variant="centered" {...props}>
        <div className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">501</div>
            <div className="font-semibold text-zinc-800">Not Implemented</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                This page is part of a planned feature that has not yet been implemented.
            </p>
            {docUrl ? <p>Learni more about the concept of this feature in the <Link href={docUrl}>documentation</Link>.</p> : null}
        </div>
        
    </AppPage>
}

export function Unauthorized({ ...props }: AppPageProps) {

    return <AppPage variant="centered" {...props}>
        <div className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">401</div>
            <div className="font-semibold text-zinc-800">Unauthorized</div>
            <Separator orientation="horizontal" className="w-40"/>
            <p>
                You need to be signed in to access this feature.
            </p>
        </div>
        
    </AppPage>
}