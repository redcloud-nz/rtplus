/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { useState } from 'react'

import { Lexington } from '@/components/blocks/lexington'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableFoot, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'




export function DevModule_TableLayout() {

    const [rowCount, setRowCount] = useState(50)

    return <>
        <Lexington.TableControls>
            <div></div>
            <InputGroup className="w-32">
                <InputGroupInput type="number" value={rowCount} onChange={(e) => setRowCount(Number(e.target.value))}/>
                <InputGroupAddon align="inline-end">rows</InputGroupAddon>
            </InputGroup>
            
        </Lexington.TableControls>
        <S2_Table 
            className="border-collapse"
            slotProps={{
                container: {
                    className: "border-1 border-border rounded-md shadow-md"
                }
            }}
        >
            <S2_TableHead className="sticky top-[var(--header-height)] bg-slate-100 z-5">
                <S2_TableRow>
                    <S2_TableHeader>ID</S2_TableHeader>
                    <S2_TableHeader>Name</S2_TableHeader>
                    <S2_TableHeader>Description</S2_TableHeader>
                    <S2_TableHeader>Details</S2_TableHeader>
                    <S2_TableHeader>Actions</S2_TableHeader>
                    <S2_TableHeader>Status</S2_TableHeader>
                </S2_TableRow>
            </S2_TableHead>
            <S2_TableBody>
                {Array.from({ length: rowCount }).map((_, idx) => 
                    <S2_TableRow key={idx}>
                        <S2_TableCell >{idx + 1}</S2_TableCell>
                        <S2_TableCell>Item {idx + 1}</S2_TableCell>
                        <S2_TableCell>This is a description for item {idx + 1}.</S2_TableCell>
                        <S2_TableCell>Details about item {idx + 1} go here.</S2_TableCell>
                        <S2_TableCell>Action {idx + 1}</S2_TableCell>
                        <S2_TableCell>{idx % 2 === 0 ? 'Active' : 'Inactive'}</S2_TableCell>
                    </S2_TableRow>
                )}
            </S2_TableBody>
            <S2_TableFoot className="sticky bottom-0 bg-background/90 z-5">
                <S2_TableRow>
                    <S2_TableCell colSpan={6} className="text-center">
                        Total Rows: {rowCount}
                    </S2_TableCell>
                </S2_TableRow>
            </S2_TableFoot>
        </S2_Table>
    </>
}