/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ArrowDownAZIcon, ArrowDownZAIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, EllipsisVerticalIcon, EyeOffIcon, GroupIcon, ListRestartIcon, SettingsIcon, UngroupIcon } from 'lucide-react'
import React, { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import { Column, ColumnDef, ColumnHelper, createColumnHelper, flexRender, RowData, Table as TanstackTable } from '@tanstack/react-table'

import { Button, ButtonProps } from './button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuGroupLabel, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from './table'

import { cn } from '@/lib/utils'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import { Show } from '../show'

// eslint-disable-next-line
const DataTableContext = React.createContext<TanstackTable<any> | null>(null)

export const DataTableProvider = DataTableContext.Provider
const useDataTable = () => {
    const table = React.useContext(DataTableContext)
    if(table == null) throw new Error("useDataTable called outside of provider.")
    return table
}


interface DataTableProps extends Omit<ComponentProps<typeof Table>, 'children'> {
    enableRowSelection?: boolean
}

export function DataTable({ enableRowSelection, ...props }: DataTableProps) {
    const table = useDataTable()

    
    return <Table {...props}>
        <DataTableHead/>
        <DataTableBody/>
    </Table>
}

export function DataTableHead(props: Omit<ComponentProps<typeof TableHead>, 'children'>) {
    const table = useDataTable()
    return <thead {...props}>
        {table.getHeaderGroups().map(headerGroup => 
            <tr key={headerGroup.id} className="divide-x divide-x-gray-400">
                {/* {enableRowSelection 
                    ? <TableHeadCell className="w-12 pl-4 leading-4">
                        <Checkbox
                            color="zinc"
                            checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? 'indeterminate' : false}
                            onCheckedChange={() => table.toggleAllRowsSelected()}
                        />
                    </TableHeadCell>
                    : null
                } */}
                {headerGroup.headers.map(header => <ColumnHeader
                    key={header.id}
                    table={table}
                    column={header.column}
                >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </ColumnHeader>)}
            </tr>
        )}
        <tr>
            <td className="h-1" colSpan={table.getVisibleFlatColumns().length}/>
        </tr>
    </thead>

}


type ColumnHeaderProps<T> = ComponentProps<typeof TableHeadCell> & {
    table: TanstackTable<T>
    // eslint-disable-next-line
    column: Column<T, any>
}

function ColumnHeader<T>({ className, children, column, table, ...props }: ColumnHeaderProps<T>) {

    const enumOptions = column.columnDef.meta?.enumOptions
    const filterValue = column.getFilterValue() as string[] ?? []

    function handleHideColumn() {
        column.toggleVisibility()
    }

    return <th {...props} className="pl-2 text-left align-middle font-medium">
        <div className={cn('w-full flex items-center justify-between gap-2', className)}>
            {column.columnDef.meta?.align == 'center' && <div className="w-8"/>}
            <div>{children}</div>
            
            <div className="flex items-center">
                {match(column.getIsSorted())
                    .with(false, () => null)
                    .with('asc', () => <ArrowDownAZIcon className="w-4 h-4 stroke-muted-foreground"/>)
                    .with('desc', () => <ArrowDownZAIcon className="w-4 h-4 text-muted-foreground"/>)
                    .exhaustive()
                }
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <EllipsisVerticalIcon/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel className="text-center">Column Options</DropdownMenuLabel>
                        {column.getCanSort() ? <>
                            <DropdownMenuSeparator/>
                            <DropdownMenuGroup>
                                <DropdownMenuGroupLabel>Sort</DropdownMenuGroupLabel>
                                <DropdownMenuItem onClick={() => column.toggleSorting()}>
                                    <ArrowDownAZIcon/>
                                    <span>Ascending</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                    <ArrowDownZAIcon/>
                                    <span>Descending</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </> : null}
                        { enumOptions && <>
                            <DropdownMenuSeparator/>
                            <DropdownMenuGroup>
                                <DropdownMenuGroupLabel>Show</DropdownMenuGroupLabel>
                                {Object.keys(enumOptions).map(key =>
                                    <DropdownMenuCheckboxItem 
                                        key={key}
                                        checked={filterValue.includes(key)}
                                        onCheckedChange={(checked) => {
                                            if(checked) column.setFilterValue([...filterValue, key])
                                            else column.setFilterValue(filterValue.filter(x => x != key))
                                        }}
                                    >
                                        <span>{enumOptions[key]}</span>
                                    </DropdownMenuCheckboxItem>
                                )}
                                
                            </DropdownMenuGroup>
                        </>}
                        {( column.getCanHide() || column.getCanGroup()) && <>
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
        </div>
    </th>
}

export function DataTableBody(props: Omit<ComponentProps<typeof TableBody>, 'children'>) {
    const table = useDataTable()

    return <TableBody {...props}>
        {table.getRowModel().rows.map(row => {
            return <TableRow key={row.id}>
                {/* { enableRowSelection
                    ? <TableCell className="pl-4 leading-4">
                        <Checkbox
                            color="zinc"
                            checked={(row.getIsAllSubRowsSelected() || row.getIsSelected()) ? true : row.getIsSomeSelected() ? 'indeterminate' : false }
                            disabled={!row.getCanSelect()}
                            onCheckedChange={row.getToggleSelectedHandler()}
                        />
                    </TableCell>
                    : null
                } */}
                {row.getVisibleCells().map(cell => {
                    const columnDef = cell.column.columnDef

                    if(cell.getIsGrouped()) {
                        return <td
                            key={cell.id}
                            colSpan={table.getVisibleFlatColumns().length}
                            className="pl-2"
                        >
                            <div className={cn(
                                'flex items-center',
                                'font-semibold'
                            )}>
                                {cell.getValue() == '' ? <span className="italic">EMPTY</span> : flexRender(columnDef.cell, cell.getContext()) }
                                <div className="grow"/>
                                
                                <div>( {row.subRows.length} )</div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="ml-2"
                                    onClick={() => row.toggleExpanded()}
                                >
                                    <ChevronDownIcon/>
                                </Button>
                            </div>
                        </td>
                    } else if(cell.getIsAggregated()) {
                        return null
                    } else if(cell.getIsPlaceholder()) {
                        return <TableCell key={`placeholder-${columnDef.id}`}/>
                    } else {
                        return <TableCell key={cell.id} align={columnDef.meta?.align}>
                            {flexRender(columnDef.cell, cell.getContext())}
                        </TableCell>
                    }
                })}
            </TableRow>
        })}
    </TableBody>
}


export function DataTableControls({ className, ...props }: ComponentProps<'div'>) {
    return <div 
        className={cn(
            'mb-2', 
            'flex gap-2',
            className
        )} 
        {...props}
    />
}

export function DataTableSearch({ placeholder, ...props }: Omit<ComponentProps<typeof Input>, 'onChange' | 'value'>) {
    const table = useDataTable()

    return <Input 
        placeholder={placeholder ?? 'Search ...'}
        value={table.getState().globalFilter}
        onChange={ev => table.setGlobalFilter(String(ev.target.value))}
        {...props}
    />
}

type DataTableColumnsDropdownProps = {
    slotProps?: {
        Button?: Omit<ButtonProps, 'onClick'>
    }
}

export function DataTableColumnsDropdown({ slotProps = {} }: DataTableColumnsDropdownProps) {
    const table = useDataTable()

    return <DropdownMenu >
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-input" {...(slotProps.Button ?? {})}>
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
}

type DataTableGroupingDropdownProps = {
    slotProps?: {
        Button?: Omit<ButtonProps, 'onClick'>
    }
}

export function DataTableGroupingDropdown({ slotProps = {}}: DataTableGroupingDropdownProps) {
    const table = useDataTable()

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-input" {...(slotProps.Button ?? {})}>
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
}

export function DataTableResetButton(props: Omit<ButtonProps, 'children' | 'onClick'>) {
    const table = useDataTable()

    return <Button variant="outline" className="border-input" {...props} onClick={() => table.reset()}><ListRestartIcon/></Button>
}

export function TableOptionsDropdown() {
    const table = useDataTable()

    const groupableColumns = table.getAllColumns().filter(column => column.getCanGroup())

    return <DropdownMenu >
        <Tooltip>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <SettingsIcon/>
                    </Button>
                </DropdownMenuTrigger>
            </TooltipTrigger>
            
            <TooltipContent>Table Options</TooltipContent>
            </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-center">Table Options</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuGroup>
                <DropdownMenuGroupLabel>Show columns</DropdownMenuGroupLabel>
                {table.getAllColumns()
                    .map(column => <DropdownMenuCheckboxItem 
                        key={column.id} 
                        checked={column.getIsVisible()}
                        onCheckedChange={() => column.toggleVisibility()}
                        disabled={!column.getCanHide()}
                    >
                        {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>)
                }
            </DropdownMenuGroup>
            <Show when={groupableColumns.length > 0}>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuGroupLabel>Group by</DropdownMenuGroupLabel>
                    {groupableColumns.map(column => 
                        <DropdownMenuCheckboxItem
                            key={column.id} 
                            checked={column.getIsGrouped()}
                            onCheckedChange={() => table.setGrouping(column.getIsGrouped() ? [] : [column.id])}
                        >
                            {column.columnDef.header as string}
                        </DropdownMenuCheckboxItem>
                    )}
                </DropdownMenuGroup>
            </Show>
            <DropdownMenuSeparator/>
            <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => table.reset()}>
                    <ListRestartIcon/>
                    <span>Reset Table</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}

export function DataTablePaginationFooter() {
    const table = useDataTable()

    const pagination = table.getState().pagination
    const rowCount = table.getRowCount()
    const startRowIndex = pagination.pageIndex * pagination.pageSize

    return <tfoot>
        <tr>
            <td colSpan={table.getVisibleFlatColumns().length}>
                { rowCount < 10
                    ? <div className="pt-3 pb-2 flex items-center text-sm text-muted-foreground">
                        <RowCount
                            start={1}
                            end={rowCount}
                            total={rowCount}
                        />
                    </div>
                    : <div className="grid grid-cols-3 items-center text-sm text-muted-foreground pt-1">
                        <RowCount
                            start={startRowIndex + 1}
                            end={Math.min(startRowIndex + pagination.pageSize, rowCount)}
                            total={rowCount}
                        />
                        <div className="flex items-center justify-center">
                            <Button 
                                variant="ghost"
                                size="icon"
                                disabled={!table.getCanPreviousPage()}
                                onClick={() => table.previousPage()}
                            >
                                <ChevronLeftIcon/>
                            </Button>
                            <div className="space-x-1 lg:space-x-1.5">
                                <span className="hidden mg:inline">Page</span>
                                <span>{pagination.pageIndex+1}</span>
                                <span>of</span>
                                <span>{table.getPageCount()}</span>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={!table.getCanNextPage()}
                                onClick={() => table.nextPage()}
                            >
                                <ChevronRightIcon/>
                            </Button>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <div className="space-x-1">
                                <span className="hidden lg:inline">rows</span>
                                <span>per page</span>
                            </div>
                            <Select value={pagination.pageSize.toString()} onValueChange={value => table.setPageSize(Number(value))}>
                                <SelectTrigger className="w-16" size="sm">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 50, 100].map(size => 
                                        <SelectItem key={size} value={size.toString()}>
                                            {size}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                }   
                
                
            </td>
        </tr>
    </tfoot>
}

function RowCount({ start, end, total }: { start: number, end: number, total: number }) {
    if(total == 0) return <div className="pl-2">No rows to display.</div>

    return <div className="space-x-1 lg:space-x-1.5 pl-2">
        <span className="hidden lg:inline">{total > 1 ? 'rows' : 'row'}</span>
        <span>{total > 1 ? `${start}-${end}` : '1'}</span>
        <span>of</span>
        <span>{total}</span>
    </div>
}

// eslint-disable-next-line
export function defineColumns<TData extends RowData>(factory: (columnHelper: ColumnHelper<TData>) => ColumnDef<TData, any>[]): ColumnDef<TData>[] {
    const columnHelper = createColumnHelper<TData>()
    return factory(columnHelper)
}