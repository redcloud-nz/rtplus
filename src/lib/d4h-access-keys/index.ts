
import { D4hAccessKey, Team } from '@prisma/client'

export type D4hAccessKeyWithTeam = Pick<D4hAccessKey, 'id' | 'key'> & { team: Pick<Team, 'id' | 'name' | 'code' | 'd4hApiUrl' | 'd4hTeamId'> }

