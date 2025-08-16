
import { formatISO } from 'date-fns'
import { z } from 'zod'

import { UTCDate } from '@date-fns/utc'

const schema = z.string().datetime()

export function ScratchComponent() {

    return <div className="space-y-2">
        <Run 
            fn={() => new Date().toISOString()}
            code={`new Date().toISOString()`}
        />
        <Run 
            fn={() => new UTCDate().toISOString()}
            code={`new UTCDate().toISOString()`}
        />
        <Run 
            fn={() => formatISO(new Date())}
            code={`formatISO(new Date())`}
        />
        <Run 
            fn={() => formatISO(new UTCDate())}
            code={`formatISO(new UTCDate())`}
        />
        <Run 
            fn={() => schema.parse(new Date().toISOString())}
            code={`schema.parse(new Date().toISOString())`}
        />
        <Run 
            fn={() => schema.parse(new UTCDate().toISOString())}
            code={`schema.parse(new UTCDate().toISOString())`}
        />
        <Run 
            fn={() => schema.parse(formatISO(new Date()))}
            code={`schema.parse(formatISO(new Date()))`}
        />
        <Run 
            fn={() => schema.parse(formatISO(new UTCDate()))}
            code={`schema.parse(formatISO(new UTCDate()))`}
        />
    </div>
}

function Run({ fn, code }: { fn: () => string, code?: string }) {

    if(!code ) {
        code = fn.toString()
        if(code.startsWith('()=>')) code = code.slice(4).trim()
    }
        
    let output: string
    try {
        output = fn()
    } catch (error) {
        output = `Error: ${error instanceof Error ? error.message : String(error)}`
    }

    return (
        <div>
            <pre>{code}</pre>
            <pre className="ml-2">{output}</pre>
        </div>
    )
}