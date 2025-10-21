/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import { ArrowRightIcon } from 'lucide-react'

import { SignedIn, SignedOut } from '@clerk/nextjs'

import Artie from '@/components/art/artie'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'


export default function Root_NotFound() {
    return <div className="w-full h-screen flex flex-col justify-center md:items-center gap-4">
        <Empty>
            <EmptyHeader>
                <EmptyMedia>
                    <Artie pose="NotFound"/>
                </EmptyMedia>
                <EmptyTitle>404 - Not Found</EmptyTitle>
                <EmptyDescription>
                    The resource you requested was not found. Have you tried looking under the couch?
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <SignedIn>
                    <Button variant="outline" asChild>
                        <Link to={Paths.dashboard}>RT+ Dashboard <ArrowRightIcon/></Link>
                    </Button>
                </SignedIn>
                <SignedOut>
                    <Button variant="outline" asChild>
                        <Link to={{ href: '/' }}>Home Page</Link>
                    </Button>
                </SignedOut>
            </EmptyContent>
        </Empty>
    </div>
}