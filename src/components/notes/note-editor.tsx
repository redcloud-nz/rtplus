'use client'

import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, linkPlugin, linkDialogPlugin, imagePlugin, tablePlugin, codeBlockPlugin, codeMirrorPlugin, sandpackPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, CreateLink, InsertImage, InsertTable, InsertThematicBreak, ListsToggle, Separator } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

interface NoteEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    className?: string
}

export function NoteEditor({ content, onChange, placeholder = "Write your note...", className }: NoteEditorProps) {
    return (
        <div className={className}>
            <MDXEditor
                markdown={content}
                onChange={onChange}
                placeholder={placeholder}
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    codeBlockPlugin(),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <>
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
                                <InsertThematicBreak />
                            </>
                        )
                    })
                ]}
                contentEditableClassName="min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
        </div>
    )
}
