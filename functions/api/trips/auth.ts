import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
} from './_helpers'

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestPost: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, {
    requireAuth: true,
    requireDb: false,
  })
  if (error) return error

  return jsonResponse({ ok: true }, 200, corsHeaders)
}
