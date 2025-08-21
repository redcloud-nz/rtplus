/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { get as getEdgeConfig } from '@vercel/edge-config'

import { Card, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

export async function FeatureFlagsCard() {

    const flagsConfig = await getEdgeConfig('flags') as Record<string, boolean>

    return <Card>
        <CardHeader>
            <CardTitle>Feature Flags</CardTitle>

            <Separator orientation="vertical"/>
            <CardExplanation>
                This card displays a list of feature flags that are currently configured in the system. Feature flags allow you to enable or disable features dynamically without deploying new code.
            </CardExplanation>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Feature</TableHeadCell>
                        <TableHeadCell>Status</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(flagsConfig).map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value ? 'Enabled' : 'Disabled'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
}