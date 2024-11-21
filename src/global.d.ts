
import '@tanstack/react-table'

declare module '@tanstack/react-table' {
    // eslint-disable-next-line
    interface ColumnMeta<TData extends RowData, TValue> {
        align?: 'left' | 'center' | 'right'
        enumOptions?: Record<string, string>
    }
}

declare global {
    interface UserPublicMetadata {
        personId: string
    }
}