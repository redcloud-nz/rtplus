
import { ArrowDownAZIcon, ArrowDownZAIcon, ChevronDownIcon, ChevronsUpDownIcon, EllipsisVerticalIcon, EyeOffIcon, GroupIcon, ListRestartIcon, UngroupIcon } from 'lucide-react'
import React from 'react'

import { Column, ColumnDef, ColumnHelper, createColumnHelper, flexRender, RowData, Table as TanstackTable } from '@tanstack/react-table'

import { Button, ButtonProps } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuGroupLabel, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableHeadCellProps, TableProps, TableRow } from './ui/table'

import { cn } from '@/lib/utils'
import { Input } from './ui/input'

// eslint-disable-next-line
const DataTableContext = React.createContext<TanstackTable<any> | null>(null)

export const DataTableProvider = DataTableContext.Provider
const useDataTable = () => {
    const table = React.useContext(DataTableContext)
    if(table == null) throw new Error("useDataTable called outside of provider.")
    return table
}

export function DataTable(props: TableProps) {
    const table = useDataTable()

    return <Table {...props}>
        <TableHead>
            {table.getHeaderGroups().map(headerGroup => 
                <TableRow key={headerGroup.id} className="divide-x divide-x-gray-400">
                    <TableHeadCell className="w-12 pl-4 leading-4">
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
                    <TableCell className="pl-4 leading-4">
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


type ColumnHeaderProps<T> = {
    table: TanstackTable<T>
    // eslint-disable-next-line
    column: Column<T, any>

} & TableHeadCellProps

function ColumnHeader<T>({ className, children, column, table, ...props }: ColumnHeaderProps<T>) {

    const enumOptions = column.columnDef.meta?.enumOptions
    const filterValue = column.getFilterValue() as string[] ?? []

    function handleHideColumn() {
        column.toggleVisibility()
    }

    return <TableHeadCell {...props} className="pr-0">
        <div className={cn('w-full flex items-center justify-between', className)}>
            {column.columnDef.meta?.align == 'center' && <div className="w-8"/>}
            <div>{children}</div>
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


export type DataTableControlsProps<T> = React.ComponentPropsWithoutRef<'div'> & {
    table: TanstackTable<T>

}

export function DataTableControls({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {

    return <div className={cn(
        'mb-2', 
        'flex gap-2',
        className
    )} {...props}/>
}

export function DataTableSearch(props: Omit<React.ComponentPropsWithRef<typeof Input>, 'onChange' | 'placeholder' | 'value'>) {
    const table = useDataTable()

    return <Input 
        {...props}
        placeholder="Search&hellip;"
        value={table.getState().globalFilter}
        onChange={ev => table.setGlobalFilter(String(ev.target.value))}
    />
}

export type DataTableColumnsDropdownProps = {
    slotProps?: {
        Button?: Omit<ButtonProps, 'onClick'>
    }
}

export function DataTableColumnsDropdown({ slotProps = {}}: DataTableColumnsDropdownProps) {
    const table = useDataTable()

    return <DropdownMenu >
        <DropdownMenuTrigger asChild>
            <Button variant="outline" {...(slotProps.Button ?? {})}>
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

export type DataTableGroupingDropdownProps = {
    slotProps?: {
        Button?: Omit<ButtonProps, 'onClick'>
    }
}

export function DataTableGroupingDropdown({ slotProps = {}}: DataTableGroupingDropdownProps) {
    const table = useDataTable()

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" {...(slotProps.Button ?? {})}>
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

    return <Button variant="outline" {...props} onClick={() => table.reset()}><ListRestartIcon/> Reset</Button>
}

// eslint-disable-next-line
export function defineColumns<TData extends RowData>(factory: (columnHelper: ColumnHelper<TData>) => ColumnDef<TData, any>[]): ColumnDef<TData>[] {
    const columnHelper = createColumnHelper<TData>()
    return factory(columnHelper)
}