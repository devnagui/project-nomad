const INGRESS_PATH = /^\/api\/hassio_ingress\/[A-Za-z0-9_-]+$/

export function parseIngressPath(value: string | undefined): string | null {
  if (!value || !INGRESS_PATH.test(value)) return null
  return value
}

export function prefixIngressUrl(url: string, ingressPath: string): string {
  if (!url.startsWith('/') || url.startsWith('//') || url.startsWith(ingressPath)) return url
  return `${ingressPath}${url}`
}

export function rewriteIngressHtml(html: string, ingressPath: string): string {
  return html
    .replace(
      /(\b(?:action|href|src)=["'])(\/(?!\/)[^"']*)/gi,
      (_match, attribute: string, url: string) =>
        `${attribute}${prefixIngressUrl(url, ingressPath)}`
    )
    .replace(
      /(&quot;url&quot;:&quot;)(\/(?!\/)[^&]*)/,
      (_match, property: string, url: string) => `${property}${prefixIngressUrl(url, ingressPath)}`
    )
}
