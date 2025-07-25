/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { functionalUpdate, makeStateUpdater, OnChangeFn, Row, RowData, Table, TableFeature, Updater } from "@tanstack/react-table"

type EditMode = 'Create' | 'Update' | 'View'

export interface EditableFeatureState<TData extends RowData> {
    /**
     * The current mode of the editing feature.
     * Can be 'Create' for new rows, 'Update' for existing rows, or 'View' for normal display.
     */
    mode: EditMode

    /**
     * The ID of the row currently being edited.
     * If no row is being edited, this will be undefined.
     */
    rowId?: string

    /**
     * The data being modified in the current row.
     * This is used to store changes before saving them.
     * If no row is being edited, this will be undefined.
     */
    modifiedRowData?: TData
}

export interface EditableFeatureTableState<TData extends RowData> {
    editing: EditableFeatureState<TData>
}
export interface EditableFeatureOptions<TData extends RowData> {
    /**
     * Enable editing functionality for the table.
     * If true, the table will support row editing features.
     */
    enableEditing?: boolean

    /**
     * Callback when the editing state changes.
     * This is used to update the table state with the new editing state.
     */
    onEditingChange?: OnChangeFn<EditableFeatureState<TData>>

    /**
     * Factory function to create a new empty row for creation.
     * This is called when a new row needs to be created.
     * @returns The template data for a new row.
     */
    createEmptyRow?: () => TData

    /**
     * Callback when a new row is created.
     * This is called when the user finishes creating a new row.
     * @param row The new row data.
     */
    onCreate?: (row: TData) => void

    /**
     * Callback when an existing row is updated.
     * This is called when the user finishes editing an existing row.
     * @param row The updated row data.
     */
    onUpdate?: (row: TData) => void

    /**
     * Callback when a row is deleted.
     * This is called when the user deletes a row.
     * @param row The original row data before deletion.
     */
    onDelete?: (row: TData) => void

    /**
     * Callback when the user cancels an edit. 
     */
    onCancel?: () => void
}

export interface EditableFeatureInstance<TData extends RowData> {
    /**
     * Set the editing state of the table.
     * This is used to update the editing state when a row is edited or created.
     * @param updater A function that receives the current editing state and returns the new state.
     */
    setEditingState: (updater: Updater<EditableFeatureState<TData>>) => void

    /**
     * Start creating a new row.
     * This will set the table to Create mode with an empty row template.
     */
    startCreating: () => void

    /**
     * Cancel the current editing operation.
     * This will reset to View mode.
     */
    cancelEditing: () => void
}

export interface EditableFeatureRow<TData extends RowData> {
    
    /**
     * Get the current edit mode of the row.
     * @returns The current edit mode: 'Create', 'Update', or 'View'.
     * If the row is not being edited, it returns 'View'.
     */
    getEditMode(): EditMode

    /**
     * Get the modified row data.
     * @returns The modified row data if editing, otherwise the original row data.
     */
    getModifiedRowData(): TData

    /**
     * Set the modified row data.
     * This is used to update the data being edited in the current row.
     * @param data The partial data to update in the current row.
     */
    setModifiedRowData: (data: Partial<TData>) => void

    /**
     * Start editing the row, setting it to 'Update' mode.
     */
    startEdit: () => void

    /**
     * Cancel the current edit, resetting the row to 'View' mode.
     */
    cancelEdit: () => void

    /**
     * End the current edit, saving the modified data.
     * If the row is in 'Create' mode, it will call the onCreate callback.
     * If the row is in 'Update' mode, it will call the onUpdate callback.
     * After saving, it resets the edit mode to 'View'.
     * If the row is not being edited, it does nothing.
     */
    saveEdit: () => void

    /**
     * Delete the row.
     * This will call the onDelete callback with the row's original data.
     * @returns 
     */
    delete: () => void
}

declare module '@tanstack/react-table' {
    interface TableState extends EditableFeatureTableState<any> {}

    interface TableOptionsResolved<TData extends RowData> extends EditableFeatureOptions<TData> {}

    interface Table<TData extends RowData> extends EditableFeatureInstance<TData> {}

    interface Row<TData extends RowData> extends EditableFeatureRow<TData> {}
}

export function EditableFeature<TData extends RowData>(): TableFeature<TData> { 
    return {
        getInitialState: (state): EditableFeatureTableState<TData> => ({
            ...state,
            editing: {
                mode: 'View',
                rowId: undefined,
                modifiedRowData: undefined
            }
        }),
        getDefaultOptions: <TData extends RowData>(table: Table<TData>): EditableFeatureOptions<TData> => ({
            enableEditing: true,
            onEditingChange: makeStateUpdater('editing', table),
            onCreate: (row) => {
                console.warn("onCreate not implemented", row)
            },
            onUpdate: (row) => {
                console.warn("onUpdate not implemented", row)
            },
            onDelete: (row) => {
                console.warn("onDelete not implemented", row)
            },
            onCancel: () => {}
        }),

        /**
         * Function to attach the editable feature functions to a table.
         * This function is called when the table is created.
         * It allows the table to have editing capabilities.
         * @param table The table instance to attach the feature to.
         */
        createTable<TData extends RowData>(table: Table<TData>): void  {

            table.setEditingState = (updater: Updater<EditableFeatureState<TData>>) => {
                const safeUpdater: Updater<EditableFeatureState<TData>> = (old) => {
                    const newState = functionalUpdate(updater, old)
                    return newState
                }
                return table.options.onEditingChange?.(safeUpdater)
            }

            table.startCreating = () => {
                const emptyRow = table.options.createEmptyRow?.() || {} as TData
                table.setEditingState({
                    mode: 'Create',
                    rowId: '__creating__',
                    modifiedRowData: emptyRow
                })
            }

            table.cancelEditing = () => {
                table.options.onCancel?.()
                table.setEditingState({
                    mode: 'View',
                    rowId: undefined,
                    modifiedRowData: undefined
                })
            }
        },

        /**
         * Function to attach the editable feature functions to a row.
         * @param row The row instance to attach the feature to.
         * @param table The table instance to which the row belongs.
         * This function is called when the row is created.
         * It allows the row to have editing capabilities.
         */
        createRow<TData extends RowData>(row: Row<TData>, table: Table<TData>): void {

            row.getEditMode = () => {
                const editingState = table.getState().editing
                return editingState.rowId === row.id ? editingState.mode : 'View'
            }

            row.getModifiedRowData = () => {
                const editingState = table.getState().editing
                if (editingState.rowId === row.id) {
                    return editingState.modifiedRowData as TData
                }
                return row.original as TData
            }

            row.setModifiedRowData = (data: Partial<TData>) => {
                const editingState = table.getState().editing
                if (editingState.rowId === row.id) {
                    const modifiedRowData = { ...editingState.modifiedRowData, ...data }
                    table.setEditingState({ ...editingState, modifiedRowData })
                } else {
                    console.warn("Cannot set modified row data when row is not being edited")
                }
            }

            row.startEdit = () => {
                table.setEditingState({ mode: 'Update', rowId: row.id, modifiedRowData: row.original })
            }

            row.cancelEdit = () => {
                table.options.onCancel?.()
                table.setEditingState({ mode: 'View', rowId: undefined, modifiedRowData: undefined })
            }

            row.saveEdit = () => {
                const editingState = table.getState().editing
                if (editingState.mode === 'Update' && editingState.modifiedRowData) {
                    const updatedRowData = { ...(row.original as Record<string, any>), ...editingState.modifiedRowData }
                    table.options.onUpdate?.(updatedRowData as TData)
                } else if (editingState.mode === 'Create' && editingState.modifiedRowData) {
                    table.options.onCreate?.(editingState.modifiedRowData)
                }
                table.setEditingState({ mode: 'View', rowId: undefined, modifiedRowData: undefined })
            }

            row.delete = () => {
                const rowData = row.original
                table.options.onDelete?.(rowData)
                table.setEditingState({ mode: 'View', rowId: undefined, modifiedRowData: undefined })
            }
        },
    }
}
