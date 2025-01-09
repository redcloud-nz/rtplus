/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { formatISO, parseISO } from 'date-fns'
import * as R from 'remeda'

const STORAGE_PREFIX = 'RTPLUS_OBJECTS'

interface LocalObjectCacheData {
    objectType: string
    objects: Record<string, string>
}

export interface LocalObjectStoreOptions {
    readonly storageKey?: string,
}

export class LocalObjectStore<T extends object> {
    readonly objectType: string
    readonly config: Required<LocalObjectStoreOptions>

    constructor(objectType: string, options: LocalObjectStoreOptions) {
        this.objectType = objectType
        this.config = {
            storageKey: `${STORAGE_PREFIX}_${objectType}`,
            ...options
        }
    }

    private getCache(): LocalObjectCacheData {
        const fetched = localStorage.getItem(this.config.storageKey)
   
        if(fetched) {
            const parsed = JSON.parse(fetched)
            
            return parsed as LocalObjectCacheData

        } else {
            // Not previously saved
            return { objectType: this.objectType, objects: {} }
        }
    }

    private updateCache(apply: (prev: LocalObjectCacheData) => LocalObjectCacheData) {
        const prev = this.getCache()
        const updated = apply(prev)

        const serialized = JSON.stringify(updated)
        localStorage.setItem(this.config.storageKey, serialized)
    }

    private serializeObject(obj: T): string {
        return JSON.stringify(obj, function(key, value) {
            if(this[key] instanceof Date)
                return { _type: 'Date', value: formatISO(this[key]) }
            else
                return value
        })
    } 

    private deserializeObject(str: string): T {
        return JSON.parse(str, function(key, value) {
            if(value['_type'] == 'Date') return parseISO(value['value'])
            else return value
        }) as T
    }

    getObject(id: string): T | null {
        const cache = this.getCache()
        const result = cache.objects[id] ? this.deserializeObject(cache.objects[id]) : null
        console.debug(`[LocalObjectStore(${this.objectType})] getObject(${id})`, result)
        return result
    }

    setObject(id: string, value: T) {
        console.debug(`[LocalObjectStore(${this.objectType})] setObject(${id})`, value)
        this.updateCache(prev => {
            return { 
                ...prev, 
                objects: { 
                    ...prev.objects, 
                    [id]: this.serializeObject(value) 
                }
            }
        })
    }

    deleteObject(id: string) {

        this.updateCache(prev => ({ ...prev, objects: R.omit(prev.objects, [id]) }))
    }

    getAll(): T[] {
        const cache = this.getCache()
        const keys = Object.keys(cache.objects)
        return keys.map(key => this.deserializeObject(cache.objects[key]))
    }
}