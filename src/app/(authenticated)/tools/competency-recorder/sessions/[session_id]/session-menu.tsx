/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { MenuIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'


export function CompetencyRecorder_Session_Menu({ sessionId }: { sessionId: string }) {

    return <DropdownMenu>
        <Tooltip>
            <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MenuIcon />
                    </Button>
                </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Session Menu</TooltipContent>
        </Tooltip>
      
        <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel className="font-bold text-center">Skill Check Session</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuLabel>Configuration</DropdownMenuLabel>
                <DropdownMenuItem asChild >
                    <Link to={Paths.tools.competencyRecorder.session(sessionId)}>
                        Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to={Paths.tools.competencyRecorder.session(sessionId).assessees}>
                        Assessees
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to={Paths.tools.competencyRecorder.session(sessionId).skills}>
                        Skills
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuLabel>Record Checks</DropdownMenuLabel>
                 <DropdownMenuItem asChild>
                    <Link to={Paths.tools.competencyRecorder.session(sessionId).recordSingle}>
                         Single
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to={Paths.tools.competencyRecorder.session(sessionId).recordByAssessee}>
                        By Assessee
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to={Paths.tools.competencyRecorder.session(sessionId).recordBySkill}>
                        By Skill
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link to={Paths.tools.competencyRecorder.session(sessionId).transcript}>
                        Transcript
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}