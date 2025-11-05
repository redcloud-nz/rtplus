/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { formatDate } from 'date-fns'
import { useMemo, useState } from 'react'

import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Lexington } from '@/components/blocks/lexington'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export function DevModule_AkagiTest() {

    const [rowCount, setRowCount] = useState(75)

    const data = useMemo(() => {
        return Array.from({ length: rowCount }).map((_, idx) => ({
            id: idx + 1,
            name: `Item ${idx + 1}`,
            description: `This is a description for item ${idx + 1}.`,
            details: `Details about item ${idx + 1} go here.`,
            date: formatDate(new Date(), 'yyyy-MM-dd'),
            status: idx % 2 === 0 ? 'Active' : 'Inactive',
        }))
    }, [rowCount])

    const columns = useMemo(() => Akagi.defineColumns<typeof data[0]>(columnHelper => [
        columnHelper.accessor('id', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>ID</Akagi.TableHeader>,
            cell: info => <Akagi.TableCell cell={info.cell}>{info.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('name', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Name</Akagi.TableHeader>,
            cell: info => <Akagi.TableCell cell={info.cell}>{info.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('description', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Description</Akagi.TableHeader>,
            cell: info => <Akagi.TableCell cell={info.cell}>{info.getValue()}</Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('details', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Details</Akagi.TableHeader>,
            cell: info => <Akagi.TableCell cell={info.cell}>{info.getValue()}</Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('date', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Date</Akagi.TableHeader>,
            cell: info => <Akagi.TableCell cell={info.cell}>{info.getValue()}</Akagi.TableCell>,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('status', {
            header: ctx => <Akagi.TableHeader header={ctx.header}>Status</Akagi.TableHeader>,
            cell: info => <Akagi.TableCell cell={info.cell}>{info.getValue()}</Akagi.TableCell>,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
    ]), [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 50, pageIndex: 0 },
        },
    })

    return <>
        <Lexington.ColumnControls>
            <Akagi.TableSearch table={table}/>
            <InputGroup className="w-32">
                <InputGroupInput type="number" value={rowCount} onChange={(e) => setRowCount(Number(e.target.value))}/>
                <InputGroupAddon align="inline-end">rows</InputGroupAddon>
            </InputGroup>
            
        </Lexington.ColumnControls>
        <Akagi.Table table={table} />
    </>
}