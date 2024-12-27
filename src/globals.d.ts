
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
        permision: 'org:competencies:assess' | 'org:d4h:personal_access' | 'org:members:manage' | 'org:teams:manage'
        role: 'org:admin' | 'org:assessor'  | 'org:member'
    }
}