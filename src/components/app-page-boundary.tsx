/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert } from './ui/alert'


export function PageBoundary({ children }: { children: React.ReactNode }) {
    return <ErrorBoundary 
        FallbackComponent={PageError}
    >
        <Suspense 
            fallback={
                <div className="h-full w-full flex items-center justify-center">
                    <LoaderCircleIcon className="animate-spin"/>
                </div>
            }
        >{children}</Suspense>
    </ErrorBoundary>
}

function PageError(props: FallbackProps) {
    return <Alert title="Rendering Error" severity="error">
        <pre>{props.error.message}</pre>
    </Alert>

}