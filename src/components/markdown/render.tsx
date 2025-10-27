/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */

import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export function RenderMarkdown({ markdown}: { markdown: string }) {
    return <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkDirective]}
        rehypePlugins={[rehypeRaw]}
    >
        {markdown}
        </Markdown>
}