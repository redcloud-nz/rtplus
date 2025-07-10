/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Alert } from './ui/alert'
import { Skeleton } from './ui/skeleton'
import { LoadingSpinner } from './ui/loading'


export function Boundary({ children }: { children: React.ReactNode }) {
    return <ErrorBoundary fallbackRender={({ error}) => <Alert severity="error" title="An error occured">{error.message}</Alert>}>
        <Suspense 
            fallback={<div className="w-full h-16 flex items-center justify-center rounded-md bg-muted animate-pulse">
                <LoadingSpinner className="w-12 h-12"/>
            </div>}
        >
            {children}
        </Suspense>
    </ErrorBoundary>
}