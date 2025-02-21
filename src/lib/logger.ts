/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export class RTPlusLogger {

    readonly componentName: string

    constructor(componentOrName: Function | string) {
        this.componentName = typeof componentOrName === 'function' ? componentOrName.name : componentOrName
    }

    debug(message: any, ...optionalParams: any[]) {
        if(typeof message === 'string') {
            console.debug(`[rtplus/${this.componentName}] ${message}`, ...optionalParams)
        }
        else {
            console.debug(`[rtplus/${this.componentName}]`, message, ...optionalParams)
        }
    }


    info(message: any, ...optionalParams: any[]) {
        if(typeof message === 'string') {
            console.info(`[rtplus/${this.componentName}] ${message}`, ...optionalParams)
        }
        else {
            console.info(`[rtplus/${this.componentName}]`, message, ...optionalParams)
        }
    }

    error(message: any, ...optionalParams: any[]) {
        if(typeof message === 'string') {
            console.error(`[rtplus/${this.componentName}] ${message}`, ...optionalParams)
        }
        else {
            console.error(`[rtplus/${this.componentName}]`, message, ...optionalParams)
        }
    }

    warn(message: any, ...optionalParams: any[]) {
        if(typeof message === 'string') {
            console.warn(`[rtplus/${this.componentName}] ${message}`, ...optionalParams)
        }
        else {
            console.warn(`[rtplus/${this.componentName}]`, message, ...optionalParams)
        }
    }

    group(groupName: string) {
        console.group(`[rtplus/${this.componentName}] ${groupName}`)
    }
    groupEnd() {
        console.groupEnd()
    }
    
}