'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { currentUser } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'

import { fieldError, FormState, fromErrorToFormState } from '@/lib/form-state'


const CreateTeamFormSchema = z.object({
    teamName: z.string().min(5).max(50),
    teamCode: z.string().max(10),
})

export async function createTeam(formState: FormState, formData: FormData) {
    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'createTeam'")

    let teamId: string
    try {
        const fields = CreateTeamFormSchema.parse(Object.fromEntries(formData))
        
        // Make sure the team name and team code are unique
        

        const nameConfict = await prisma.team.findFirst({
            where: { name: fields.teamName }
        })
        if(nameConfict) {
            return fieldError('teamName', `Team name '${fields.teamName}' is already taken.`)
        }

        if(fields.teamCode) {
            const codeConfict = await prisma.team.findFirst({
                where: { code: fields.teamCode }
            })
            if(codeConfict) return fieldError('teamCode', `Team code '${fields.teamCode}' is already taken.`)
        }

        const createdTeam = await prisma.team.create({
            data: { name: fields.teamName, code: fields.teamCode, color: "" }
        })

        teamId = fields.teamCode
    } catch(error) {
        return fromErrorToFormState(error)
    }

    revalidatePath('/manage/teams')
    redirect(`/manage/teams/${teamId}`)
}


