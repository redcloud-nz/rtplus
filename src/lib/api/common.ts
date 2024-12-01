
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_PAGE_SIZE = 1000

export interface ListResponse<TData extends object> {
    data: TData[]
    pagination: {
        totalSize: number
        pageSize: number
        totalPages: number
        currentPage: number
    }
}

/**
 * Create a list response which contains all records for the given query.
 */
export function createListResponse<TData extends object>(data: TData[]): ListResponse<TData> {

    return { 
        data, 
        pagination: {
            totalSize: data.length,
            pageSize: data.length,
            totalPages: 1,
            currentPage: 0
        }
    }
}
