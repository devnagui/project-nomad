const INGRESS_PATH = /^\/api\/hassio_ingress\/[A-Za-z0-9_-]+/

export function getIngressPath(pathname: string): string {
  return pathname.match(INGRESS_PATH)?.[0] ?? ''
}

export function getAppPathname(pathname: string): string {
  const ingressPath = getIngressPath(pathname)
  return ingressPath ? pathname.slice(ingressPath.length) || '/' : pathname
}

export function withIngressPath(url: string, ingressPath: string): string {
  if (!ingressPath || !url.startsWith('/') || url.startsWith('//') || url.startsWith(ingressPath)) {
    return url
  }
  return `${ingressPath}${url}`
}

export function withIngressOrigin(url: string, ingressPath: string, origin: string): string {
  const pathUrl = withIngressPath(url, ingressPath)
  if (pathUrl !== url || !ingressPath) return pathUrl

  try {
    const parsed = new URL(url)
    if (parsed.origin !== origin) return url
    parsed.pathname = withIngressPath(parsed.pathname, ingressPath)
    return parsed.toString()
  } catch {
    return url
  }
}
