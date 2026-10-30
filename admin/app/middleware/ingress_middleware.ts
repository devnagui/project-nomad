import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { parseIngressPath, prefixIngressUrl, rewriteIngressHtml } from '../utils/ingress.js'

export default class IngressMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const ingressPath = parseIngressPath(request.header('x-ingress-path'))
    await next()

    if (!ingressPath) return

    for (const header of ['location', 'x-inertia-location']) {
      const value = response.getHeader(header)
      if (typeof value === 'string') {
        response.header(header, prefixIngressUrl(value, ingressPath))
      }
    }

    const body = response.getBody()
    if (typeof body === 'string') {
      const contentType = response.getHeader('content-type')
      if (typeof contentType === 'string' && contentType.includes('text/html')) {
        response.send(rewriteIngressHtml(body, ingressPath))
      }
      return
    }

    if (body && typeof body === 'object' && 'url' in body && typeof body.url === 'string') {
      body.url = prefixIngressUrl(body.url, ingressPath)
    }
  }
}
