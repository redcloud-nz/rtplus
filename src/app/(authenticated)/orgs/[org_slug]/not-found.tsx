/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]
 */


import Artie from '@/components/art/artie'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'



export default async function Organization_NotFound() {

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
        </Empty>
    </div>
}