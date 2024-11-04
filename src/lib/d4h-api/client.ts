import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'

import type { paths } from './schema'

export const D4hFetchClient = createFetchClient<paths>({ baseUrl: 'https://api.team-manager.ap.d4h.com' })

export const D4hApi = createClient(D4hFetchClient)