/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use client'

import { ForwardedRef } from 'react'

import {
    headingsPlugin, listsPlugin, quotePlugin, markdownShortcutPlugin, linkPlugin, linkDialogPlugin, 
    imagePlugin, tablePlugin, codeBlockPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, 
    CreateLink, InsertImage, InsertTable, ListsToggle, Separator,
    MDXEditor, 
    type MDXEditorMethods,
    type MDXEditorProps,
} from '@mdxeditor/editor'

import '@mdxeditor/editor/style.css'



export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return <MDXEditor
        plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin(),
            toolbarPlugin({
                toolbarContents: () => <>
                    <UndoRedo />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <Separator />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertImage />
                    <Separator />
                    <InsertTable />
                </>
            })
        ]}
        {...props}
        ref={editorRef}
    />
}