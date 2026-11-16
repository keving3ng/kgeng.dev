import { errorResponse, logger } from '../_shared'
import {
  TripsEnv,
  guardRequest,
  handleOptions,
  jsonResponse,
} from './_helpers'
import {
  extractGetListUrlsFromHtml,
  extractListIdFromUrl,
  extractTitleFromHtml,
  isAllowedGoogleMapsUrl,
  isGoogleMapsListUrl,
  parseEntityListJson,
  parsePlaceFromGoogleMapsUrl,
} from './_mapsParser'

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

export const onRequestOptions: PagesFunction<TripsEnv> = async ({ request }) => {
  return handleOptions(request)
}

export const onRequestPost: PagesFunction<TripsEnv> = async ({ request, env }) => {
  const { corsHeaders, error } = await guardRequest(request, env, {
    requireAuth: true,
    requireDb: false,
  })
  if (error) return error

  try {
    const body = (await request.json()) as { url?: string }
    const inputUrl = body.url ? isAllowedGoogleMapsUrl(body.url) : null
    if (!inputUrl) {
      return errorResponse(400, 'please paste a valid google maps link', corsHeaders)
    }

    const res = await fetch(inputUrl.toString(), {
      redirect: 'follow',
      headers: FETCH_HEADERS,
    })

    if (!res.ok) {
      return errorResponse(502, 'failed to reach google maps', corsHeaders)
    }

    const finalUrl = isAllowedGoogleMapsUrl(res.url || inputUrl.toString())
    if (!finalUrl) {
      return errorResponse(400, 'redirected to an unsupported host', corsHeaders)
    }

    if (isGoogleMapsListUrl(finalUrl)) {
      const html = await res.text()
      const listTitle = extractTitleFromHtml(html)

      const candidateUrls = extractGetListUrlsFromHtml(html)
      const listId = extractListIdFromUrl(finalUrl)
      if (listId) {
        candidateUrls.push(
          `https://www.google.com/maps/preview/entitylist/getlist?authuser=0&hl=en&gl=us&pb=!1m1!1s${encodeURIComponent(listId)}!2e2!3e2!4i500!6m3!1i0!2i0!3i0!16b1!23i1`,
        )
      }

      for (const candidate of candidateUrls) {
        const listRes = await fetch(candidate, { headers: FETCH_HEADERS })
        if (!listRes.ok) continue
        const rawText = await listRes.text()
        const spots = parseEntityListJson(rawText)
        if (spots.length > 0) {
          return jsonResponse(
            {
              kind: 'list',
              listTitle,
              sourceUrl: finalUrl.toString(),
              spots,
            },
            200,
            corsHeaders,
          )
        }
      }

      return errorResponse(
        422,
        'could not read spots from that google maps list — make sure the list is shared publicly',
        corsHeaders,
      )
    }

    const spot = parsePlaceFromGoogleMapsUrl(finalUrl)
    if (!spot.name) {
      const html = await res.text()
      const title = extractTitleFromHtml(html)
      if (title) spot.name = title
    }

    return jsonResponse(
      {
        kind: 'place',
        listTitle: null,
        sourceUrl: finalUrl.toString(),
        spots: [spot],
      },
      200,
      corsHeaders,
    )
  } catch (err) {
    logger.error('Failed to import Google Maps URL', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return errorResponse(500, 'failed to import google maps link', corsHeaders)
  }
}
