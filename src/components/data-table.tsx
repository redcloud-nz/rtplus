
import { ArrowDownAZIcon, ArrowDownZAIcon, ChevronDownIcon, ChevronsUpDownIcon, EllipsisVerticalIcon, EyeOffIcon, GroupIcon, UngroupIcon } from 'lucide-react'
import React from 'react'

import { Column, flexRender, Table as TanstackTable } from '@tanstack/react-table'

import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableHeadCellProps, TableProps, TableRow } from './ui/table'

import { cn } from '@/lib/utils'
import { Input } from './ui/input'


export type DataTableProps<T> = {
    table: TanstackTable<T>
} & TableProps

export function DataTable<T>({ table, ...props}: DataTableProps<T>) {
    return <Table {...props}>
            <TableHead>
                {table.getHeaderGroups().map(headerGroup => 
                    <TableRow key={headerGroup.id} className="divide-x divide-x-gray-400">
                        <TableHeadCell>
                            <Checkbox
                                color="zinc"
                                checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? 'indeterminate' : false}
                                onCheckedChange={() => table.toggleAllRowsSelected()}
                            />
                        </TableHeadCell>
                        {headerGroup.headers.map(header => <ColumnHeader
                            key={header.id}
                            table={table}
                            column={header.column}
                        >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </ColumnHeader>)}
                    </TableRow>
                )}
            </TableHead>
            <TableBody>
                {table.getRowModel().rows.map(row => {
                    return <TableRow key={row.id}>
                        <TableCell>
                            <Checkbox
                                color="zinc"
                                checked={(row.getIsAllSubRowsSelected() || row.getIsSelected()) ? true : row.getIsSomeSelected() ? 'indeterminate' : false }
                                disabled={!row.getCanSelect()}
                                onCheckedChange={row.getToggleSelectedHandler()}
                            />
                        </TableCell>
                        {row.getVisibleCells().map(cell => {
                            const columnDef = cell.column.columnDef

                            if(cell.getIsGrouped()) {
                                return <TableCell
                                    key={cell.id}
                                    className=""
                                    colSpan={table.getVisibleFlatColumns().length}
                                >
                                    <div className={cn(
                                        'flex items-center',
                                        'font-bold'
                                    )}>
                                        {cell.getValue() == '' ? <span className="italic">EMPTY</span> : flexRender(columnDef.cell, cell.getContext()) }
                                        <div className="grow"/>
                                        
                                        <div>( {row.subRows.length} )</div>
                                        <Button variant="ghost" className="ml-2 -mr-2" onClick={() => row.toggleExpanded()}>
                                            <ChevronsUpDownIcon data-slot="icon" className="size-5 text-gray-400 group-hover:text-gray-500"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            } else if(cell.getIsAggregated()) {
                                return null
                            } else if(cell.getIsPlaceholder()) {
                                return <TableCell key={columnDef.id}/>
                            } else {
                                return <TableCell key={cell.id} align={columnDef.meta?.align}>
                                    {flexRender(columnDef.cell, cell.getContext())}
                                </TableCell>
                            }
                        })}
                    </TableRow>
                })}
            </TableBody>
        </Table>
}


type ColumnHeaderProps = {
    table: TanstackTable<any>
    column: Column<any, any>

} & TableHeadCellProps

function ColumnHeader({ className, children, column, table, ...props }: ColumnHeaderProps) {

    const isSorted = column.getIsSorted()

    function handleHideColumn() {
        column.toggleVisibility()
    }

    return <TableHeadCell {...props} className="pr-0">
        <div className={cn('w-full flex items-center justify-between', className)}>
            <div>{children}</div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                    {column.getCanSort() ? <>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => column.toggleSorting()}>
                                <ArrowDownAZIcon/>
                                <span>Sort Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                <ArrowDownZAIcon/>
                                <span>Sort Descending</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </> : null}
                    {(column.getCanHide() || column.getCanGroup()) && <>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            {column.getCanGroup() && <DropdownMenuItem
                                onClick={() => table.setGrouping(column.getIsGrouped() ? [] : [column.id])}
                            >
                                {column.getIsGrouped() ? <UngroupIcon data-slot="icon"/> : <GroupIcon data-slot="icon"/>}
                                <span>Group by</span>
                            </DropdownMenuItem>}
                            {column.getCanHide() && <DropdownMenuItem onClick={handleHideColumn}>
                                <EyeOffIcon/>
                                <span>Hide Column</span>
                            </DropdownMenuItem>}
                        </DropdownMenuGroup>
                    </>}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </TableHeadCell>
}


export type DataTableControlsProps = {
    className?: string
    table: TanstackTable<any>

}

export function DataTableControls({className, table, ...props}: DataTableControlsProps) {
    
    return <div className={cn(
        'mt-4 mb-2', 
        'flex gap-2',
        className
    )}>
        <Input 
            placeholder="Search&hellip;"
            value={table.getState().globalFilter}
            onChange={ev => table.setGlobalFilter(String(ev.target.value))}
        />
        <DropdownMenu >
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Columns
                    <ChevronDownIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Column visibility</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {table.getAllColumns()
                    .filter(column => column.getCanHide())
                    .map(column => <DropdownMenuCheckboxItem 
                        key={column.id} 
                        checked={column.getIsVisible()}
                        onCheckedChange={() => column.toggleVisibility()}
                    >
                        {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>)}
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Group By
                    <ChevronDownIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Group rows by</DropdownMenuLabel>
                {table.getAllColumns()
                    .filter(column => column.getCanGroup())
                    .map(column => <DropdownMenuCheckboxItem
                        key={column.id} 
                        checked={column.getIsGrouped()}
                        onCheckedChange={() => table.setGrouping(column.getIsGrouped() ? [] : [column.id])}
                    >
                        {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>)}
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
}