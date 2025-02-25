/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Person } from '@prisma/client'


export function PersonAccessCard({ person }: { person: Person }) {
    

    return <Card>
        <CardHeader>
            <CardTitle>Access</CardTitle>
        </CardHeader>
        <CardContent>
            
        </CardContent>
    </Card>
}