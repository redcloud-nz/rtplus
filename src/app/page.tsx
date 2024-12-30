/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import Image from 'next/image'

import { AppPage } from '@/components/app-page'

export default function Home() {
    return <AppPage label="Home" className="flex flex-col items-center justify-center">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <Image
                className="dark:invert"
                src="/logo.svg"
                alt="RT+ logo"
                width={200}
                height={100}
                priority
            />
            <p>
                A collection of tools for managing response teams.
            </p>
            <ul className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                <li className="mb-2">Integrates with D4H.</li>
                <li className="mb-2">Works with multiple teams.</li>
                <li>Open source.</li>
            </ul>
            
        </main>
    </AppPage>
}
