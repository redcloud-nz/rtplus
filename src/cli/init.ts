/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export function init() {
    console.log("Initializing RT+ CLI...");

    (async () => {
        const [bootstrap, personnel] = await Promise.all([import('./bootstrap'), import('./personnel')])

        const rtplus = Object.freeze({
            bootstrap: bootstrap.default,
            personnel
        })
    
        Object.assign(window, { rtplus })
    })()    

    console.log("RT+ CLI initialized.");
}


export function printConsoleMessage() {
    const year = new Date().getFullYear()

    const message =
        ` _______   _________                                                                                               \n`+
        `|_   __ @ |  _   _  |  .-.        RT+ Command Line Interface                                                       \n`+
        `  | |__) ||_/ | | @_|__| |__      Run init() to get started.                                                       \n`+
        `  |  __ /     | |   |__   __|                                                                                      \n`+
        ` _| |  @ @_  _| |_     | |        Documentation: https://github.com/redcloud-nz/rtplus/wiki/Command-Line-Interface \n`+
        `|____| |___||_____|    '-'        Copyright ${year} Redcloud Development, Ltd.                                     \n`+
        `                                                                                                                   \n`
    
    console.log(message.replaceAll('@', '\\'))
}