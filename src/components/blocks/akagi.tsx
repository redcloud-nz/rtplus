/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Akagi data table components.
 * 
 * A set of components for displaying and interacting with data tables.
 */

import { ArrowDownAZIcon, ArrowDownZAIcon, ChevronsUpDownIcon, FunnelIcon, SearchIcon } from 'lucide-react'
import { ComponentProps, Fragment } from 'react'
import { match } from 'ts-pattern'

import { CellContext, ColumnDef, ColumnHelper, createColumnHelper, flexRender, HeaderContext, RowData, Table as TanstackTable } from '@tanstack/react-table'

import { S2_Button } from '../ui/s2-button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'

import { cn } from '@/lib/utils'



type AkagiTableHeaderProps<TData extends RowData> = Omit<ComponentProps<'th'>, 'align'> & Pick<HeaderContext<TData, unknown>, 'header'> & {
    align?: 'start' | 'center' | 'end'
    filterOptions?: string[]
    showAbove?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

function AkagiTableHeader<TData extends RowData>({ align = "start", children, className, filterOptions, header, showAbove: showAbove, ...props }: AkagiTableHeaderProps<TData>) {
    const canFilter = header.column.getCanFilter() && filterOptions && filterOptions.length > 0
    const canSort = header.column.getCanSort()
    const isSorted = header.column.getIsSorted()

    return <S2_TableHeader 
        className={cn("",
            showAbove == 'sm' && 'hidden sm:table-cell',
            showAbove == 'md' && 'hidden md:table-cell',
            showAbove == 'lg' && 'hidden lg:table-cell',
            showAbove == 'xl' && 'hidden xl:table-cell',
            showAbove == '2xl' && 'hidden 2xl:table-cell',
            className
        )} 
        {...props}
    >
        <div className={cn(
            "flex items-center",
            align == "start", "justify-start",
            align == "center" && "justify-center" + ((canFilter || canSort) ? " pl-8" : ""),
            align == "end" && "justify-end",
        )}>
            {children}
            { canSort
                ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <S2_Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            {match(isSorted)
                                .with('asc', () => <ArrowDownAZIcon className="size-4"/>)
                                .with('desc', () => <ArrowDownZAIcon className="size-4"/>)
                                .otherwise(() => <ChevronsUpDownIcon className="size-4"/>)
                            }
                        </S2_Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32">
                        <DropdownMenuLabel>Sort</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => header.column.toggleSorting(false)} disabled={isSorted == 'asc'}>
                            <ArrowDownAZIcon />
                            <span>Ascending</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => header.column.toggleSorting(true)} disabled={isSorted == 'desc'}>
                            <ArrowDownZAIcon/>
                            <span>Descending</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                : null
            }
            { canFilter
                ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <S2_Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <FunnelIcon className="size-4"/>
                        </S2_Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32">
                        <DropdownMenuLabel>Filter</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        {filterOptions.map(option => {
                            const checked = (header.column.getFilterValue() as string[] ?? []).includes(option)
                            return <DropdownMenuCheckboxItem
                                key={option}
                                checked={checked}
                                onSelect={(ev) => {
                                    ev.preventDefault()
                                    if(checked) header.column.setFilterValue((header.column.getFilterValue() as string[] ?? []).filter(v => v !== option))
                                    else header.column.setFilterValue([...(header.column.getFilterValue() as string[] ?? []), option])
                                }}
                            >{option}</DropdownMenuCheckboxItem>
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
                : null
            }
        </div>
    </S2_TableHeader>
}

type AkagiTableCellProps<TData extends RowData> = Omit<ComponentProps<'td'>, 'align'> & Pick<CellContext<TData, unknown>, 'cell'> & {
    align?: 'start' | 'center' | 'end'
    showAbove?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

function AkagiTableCell<TData extends RowData>({ align = "start", children, className, showAbove, ...props }: AkagiTableCellProps<TData>) {
    return <S2_TableCell 
        className={cn(
            align == 'start' && 'text-start',
            align == 'center' && 'text-center',
            align == 'end' && 'text-end',
            showAbove == 'sm' && 'hidden sm:table-cell',
            showAbove == 'md' && 'hidden md:table-cell',
            showAbove == 'lg' && 'hidden lg:table-cell',
            showAbove == 'xl' && 'hidden xl:table-cell',
            showAbove == '2xl' && 'hidden 2xl:table-cell',
            className
        )}
        {...props}
    >
        {children}
    </S2_TableCell>
}


function AkagiTable<TData extends RowData>({ table }: { table: TanstackTable<TData> }) {
    return <S2_Table 
        className=""
        slots={{ 
            container: { 
                className: "border-1 border-border rounded-md shadow-md [scrollbar-gutter:stable] [scrollbar-color:var(--scrollbar-thumb)_transparent]"               
            }
        }}
    >
        <S2_TableHead className="sticky top-0 bg-background/90 backdrop-blur-md z-10 shadow-xs">
            {table.getHeaderGroups().map(headerGroup =>
                <S2_TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header =>
                        <Fragment key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </Fragment>
                    )}
                </S2_TableRow>
            )}
            <S2_TableRow>
                <th colSpan={table.getAllColumns().length} className="h-[1px] border-t"></th>
            </S2_TableRow>
        </S2_TableHead>
        <S2_TableBody>
            {table.getRowModel().rows.map(row =>
                <S2_TableRow key={`${row.id}`}>
                    {row.getVisibleCells().map(cell =>
                        <Fragment key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Fragment>
                    )}
                </S2_TableRow>
            )}
            {table.getRowCount() === 0 && <tr><td colSpan={table.getAllColumns().length} className="text-center py-4">No results found</td></tr>}
        </S2_TableBody>
    </S2_Table>
}

function AkagiTableSearch<TData extends RowData>({ className, table, ...props }: ComponentProps<typeof InputGroup> & { table: TanstackTable<TData> }) {
    
    return <InputGroup className={cn("max-w-sm", className)} {...props}>
        <InputGroupInput 
            placeholder="Search..."
            value={table.getState().globalFilter ?? ""}
            onChange={ev => table.setGlobalFilter(ev.target.value)}
        />
        <InputGroupAddon>
            <SearchIcon className="size-4"/>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">{table.getRowCount()} results</InputGroupAddon>
    </InputGroup>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defineColumns<TData extends RowData>(factory: (columnHelper: ColumnHelper<TData>) => (ColumnDef<TData, any> | null)[]): ColumnDef<TData>[] {
    const columnHelper = createColumnHelper<TData>()
    const columns = factory(columnHelper)

    return columns.filter((column): column is ColumnDef<TData> => column !== null)
}

export const Akagi = {
    Table: AkagiTable,
    TableHeader: AkagiTableHeader,
    TableCell: AkagiTableCell,
    TableSearch: AkagiTableSearch,
    defineColumns
}