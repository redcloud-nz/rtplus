/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { bootstrapAction } from './bootstrap-action'

export default function bootstrap() {

    (async () => {
        try {
            const result = await bootstrapAction()
            if(result.success) {
                console.log(`Bootstrap successful. Created person: ${result.person?.name}`)
            } else {
                console.log('Bootstrap not required.')
            }
        } catch(error) {
            console.error(error)
        }
        
    })()
}
