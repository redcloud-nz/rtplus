
import '@tanstack/react-table'

declare module '@tanstack/react-table' {
    // eslint-disable-next-line
    interface ColumnMeta<TData extends RowData, TValue> {
        align?: 'left' | 'center' | 'right'
        enumOptions?: Record<string, string>
    }
}

export {}

declare global {
    interface UserPublicMetadata {
        personId: string
    }

    interface ClerkAuthorization {
        permision: 'org:members:manage' | 'org:teams:manage' | 'org:d4h:personal_access'
        role: 'org:admin' | 'org:member'
    }
}