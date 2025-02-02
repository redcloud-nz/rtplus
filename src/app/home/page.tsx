
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary'

import { HydrateClient, trpc } from '@/trpc/server'

import { ClientGreeting } from './client-greeting'

export default async function Home() {
    void trpc.hello.prefetch({ text: 'world' })
  
    return <HydrateClient>
        <div>...</div>
        {/** ... */}
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Suspense fallback={<div>Loading...</div>}>
                <ClientGreeting />
            </Suspense>
        </ErrorBoundary>
    </HydrateClient>
}