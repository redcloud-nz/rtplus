/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use client'

import { ForwardedRef } from 'react'

import {
    headingsPlugin, listsPlugin, quotePlugin, markdownShortcutPlugin, linkPlugin,
    tablePlugin, toolbarPlugin,Separator,
    MDXEditor, 
    type MDXEditorMethods,
    type MDXEditorProps,
    linkDialogPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import './markdown.css'

import { cn } from '@/lib/utils'

import { CreateLinkButton, FormatTextToggleGroup, InsertTableButton, ListStyleToggleGroup } from './toolbar'



export default function InitializedMDXEditor({ className, editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return <MDXEditor
        contentEditableClassName="markdown-content text-sm min-h-16"
        plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            // imagePlugin(),
            tablePlugin(),
            toolbarPlugin({
                toolbarContents: () => <>
                    <FormatTextToggleGroup options={['bold', 'italic', 'underline']} />
                    <Separator />
                    <ListStyleToggleGroup/>
                    <Separator />
                    <CreateLinkButton />
                    {/* <InsertImage /> */}
                    {/* <Separator /> */}
                    <InsertTableButton />
                </>
            }),
            markdownShortcutPlugin()
        ]}
        {...props}
        ref={editorRef}
    />
}
