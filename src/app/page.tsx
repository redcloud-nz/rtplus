/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import { ClockIcon, CombineIcon, ListChecksIcon, NotebookTextIcon, PocketKnifeIcon, WalletCardsIcon } from 'lucide-react'
import Image from 'next/image'


import { AppPage, AppPageContainer } from '@/components/app-page'
import { Link } from '@/components/ui/link'
import { cn } from '@/lib/utils'

import * as Paths from '@/paths'



export default function PublicHomePage() {
    return <AppPageContainer>
        <AppPage label="">
            <div className="container mx-auto">
                <div className="flex flex-col items-center gap-4 my-4">
                    <Image
                        className="dark:invert"
                        src="/logo.svg"
                        alt="RT+ logo"
                        width={200}
                        height={100}
                        priority
                    />
                    <p>Response Team Management Tools.</p>
                </div>
            </div>
        </AppPage>
    </AppPageContainer>
    
        
}

