/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { AppPageContent, AppPageContentProps } from '@/components/app-page'
import { ExternalLink, GitHubIssueLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Paragraph } from '@/components/ui/typography'




export function NotFound(props: AppPageContentProps) {

    return <AppPageContent variant="centered" {...props}>
        <main className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">404</div>
            <div className="font-semibold text-zinc-800">Not Found</div>
            <Separator orientation="horizontal" className="w-40"/>
            <Paragraph>
                The resource you requested was not found. Have you tried turning it off and on again?
            </Paragraph>
        </main>
        
    </AppPageContent>
}

export type NotImplementedProps = AppPageContentProps & { 
    docUrl?: string
    ghIssueNumber?: number
}

export function NotImplemented({ docUrl, ghIssueNumber, ...props }: NotImplementedProps) {

    return <AppPageContent variant="centered" {...props}>
        <div className="flex flex-col gap-2 justify-center items-center">
            <div className="font-semibold text-2xl text-zinc-800">501</div>
            <div className="font-semibold text-zinc-800">Not Implemented</div>
            <Separator orientation="horizontal" className="w-40"/>
            <Paragraph>
                This page is part of a planned or proposed feature that has not yet been implemented.
            </Paragraph>
            {docUrl ? <Paragraph>Learn more about the concept of this feature in the <ExternalLink href={docUrl}>documentation</ExternalLink>.</Paragraph> : null}

            {ghIssueNumber ? <Paragraph>Learn more about this proposal: <GitHubIssueLink issueNumber={ghIssueNumber}></GitHubIssueLink>.</Paragraph> : null}
        </div>
        
    </AppPageContent>
}

export function Unauthorized({ ...props }: AppPageContentProps) {

    return <AppPageContent variant="centered" {...props}>
        <div className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">401</div>
            <div className="font-semibold text-zinc-800">Unauthorized</div>
            <Separator orientation="horizontal" className="w-40"/>
            <Paragraph>
                You need to be signed in to access this feature.
            </Paragraph>
        </div>
        
    </AppPageContent>
}

export function Forbidden({ ...props }: AppPageContentProps) {
    return <AppPageContent variant="centered" {...props}>
        <div className="flex flex-col gap-2 items-center">
            <div className="font-semibold text-2xl text-zinc-800">403</div>
            <div className="font-semibold text-zinc-800">Forbidden</div>
            <Separator orientation="horizontal" className="w-40"/>
            <Paragraph>
                You do not have permission to access this page.
            </Paragraph>
        </div>
        
    </AppPageContent>
}