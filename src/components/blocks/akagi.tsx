/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Akagi data table components.
 * 
 * A set of components for displaying and interacting with data tables.
 */

import { ArrowDownAZIcon, ArrowDownZAIcon, EllipsisVerticalIcon, SearchIcon } from 'lucide-react'
import { ComponentProps, Fragment } from 'react'
import { match } from 'ts-pattern'

import { CellContext, ColumnDef, ColumnHelper, createColumnHelper, flexRender, HeaderContext, RowData, Table as TanstackTable } from '@tanstack/react-table'

import { S2_Button } from '../ui/s2-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'

import { cn } from '@/lib/utils'



type AkagiTableHeaderProps<TData extends RowData> = Omit<ComponentProps<'th'>, 'align'> & Pick<HeaderContext<TData, unknown>, 'header'> & {
    align?: 'start' | 'center' | 'end'
    showAbove?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

function AkagiTableHeader<TData extends RowData>({ align = "start", children, className, header, showAbove: showAbove, ...props }: AkagiTableHeaderProps<TData>) {
    const canSort = header.column.getCanSort()
    const isSorted = header.column.getIsSorted()

    return <S2_TableHeader 
        className={cn("relative",
            canSort && "pr-12",
            align == "start", "text-start",
            align == "center" && "text-center",
            align == "end" && "text-end",
            canSort && align == 'center' && "px-12",
            showAbove == 'sm' && 'hidden sm:table-cell',
            showAbove == 'md' && 'hidden md:table-cell',
            showAbove == 'lg' && 'hidden lg:table-cell',
            showAbove == 'xl' && 'hidden xl:table-cell',
            showAbove == '2xl' && 'hidden 2xl:table-cell',
            className
        )} 
        {...props}
    > 
        <div className="absolute h-5 right-0 top-1/2 -transform -translate-y-1/2 flex items-center border-r border-muted">
            {canSort && <> 
                {match(isSorted)
                    .with('asc', () => <ArrowDownAZIcon className="size-4 text-muted-foreground"/>)
                    .with('desc', () => <ArrowDownZAIcon className="size-4 text-muted-foreground"/>)
                    .otherwise(() => <div className="size-4"/>)
                }
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <S2_Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <EllipsisVerticalIcon className="size-4"/>
                        </S2_Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Sort</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => header.column.toggleSorting(false)} disabled={isSorted == 'asc'}>
                                <ArrowDownAZIcon />
                                <span>Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => header.column.toggleSorting(true)} disabled={isSorted == 'desc'}>
                                <ArrowDownZAIcon/>
                                <span>Descending</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>       
            </>}
        </div>
        {children}
    </S2_TableHeader>
}


function AkagiTableHeader2<TData extends RowData>({ align = "start", children, className, header, showAbove: showAbove, ...props }: AkagiTableHeaderProps<TData>) {
    const canSort = header.column.getCanSort()
    const isSorted = header.column.getIsSorted()

    return <S2_TableHeader 
        className={cn("relative",
            canSort && "pr-12",
            align == "start", "text-start",
            align == "center" && "text-center",
            align == "end" && "text-end",
            canSort && align == 'center' && "px-12",
            showAbove == 'sm' && 'hidden sm:table-cell',
            showAbove == 'md' && 'hidden md:table-cell',
            showAbove == 'lg' && 'hidden lg:table-cell',
            showAbove == 'xl' && 'hidden xl:table-cell',
            showAbove == '2xl' && 'hidden 2xl:table-cell',
            className
        )} 
        {...props}
    > 
        <div className="absolute h-5 right-0 top-1/2 -transform -translate-y-1/2 flex items-center border-r border-muted">
            {canSort && <> 
                {match(isSorted)
                    .with('asc', () => <ArrowDownAZIcon className="size-4 text-muted-foreground"/>)
                    .with('desc', () => <ArrowDownZAIcon className="size-4 text-muted-foreground"/>)
                    .otherwise(() => <div className="size-4"/>)
                }
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <S2_Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <EllipsisVerticalIcon className="size-4"/>
                        </S2_Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Sort</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => header.column.toggleSorting(false)} disabled={isSorted == 'asc'}>
                                <ArrowDownAZIcon />
                                <span>Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => header.column.toggleSorting(true)} disabled={isSorted == 'desc'}>
                                <ArrowDownZAIcon/>
                                <span>Descending</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>       
            </>}
        </div>
        {children}
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
                className: "border-1 rounded-md shadow-md [scrollbar-gutter:stable] [scrollbar-color:var(--scrollbar-thumb)_transparent]"               
            }
        }}
    >
        <S2_TableHead className="sticky top-0 bg-background/90 backdrop-blur-md z-10">
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
                <S2_TableRow key={row.id}>
                    {row.getVisibleCells().map(cell =>
                        <Fragment key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Fragment>
                    )}
                </S2_TableRow>
            )}
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
    TableHeader: AkagiTableHeader2,
    TableCell: AkagiTableCell,
    TableSearch: AkagiTableSearch,
    defineColumns
}