import { router } from '@inertiajs/react'
import {
  getAppPathname as getAppPathnameForPath,
  getIngressPath as getIngressPathForPath,
  withIngressPath as withIngressPathForBase,
} from './ingress_path'

export function getIngressPath(pathname = window.location.pathname): string {
  return getIngressPathForPath(pathname)
}

export function getAppPathname(pathname = window.location.pathname): string {
  return getAppPathnameForPath(pathname)
}

export function withIngressPath(url: string, ingressPath = getIngressPath()): string {
  return withIngressPathForBase(url, ingressPath)
}

function rewriteUrlAttribute(element: Element, attribute: 'action' | 'href' | 'src') {
  const value = element.getAttribute(attribute)
  if (value) element.setAttribute(attribute, withIngressPath(value))
}

export function installIngressRuntime() {
  const ingressPath = getIngressPath()
  if (!ingressPath) return

  const nativeFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    if (typeof input === 'string') return nativeFetch(withIngressPath(input, ingressPath), init)
    if (input instanceof URL) {
      const url = new URL(input)
      if (url.origin === window.location.origin)
        url.pathname = withIngressPath(url.pathname, ingressPath)
      return nativeFetch(url, init)
    }
    if (input.url.startsWith(window.location.origin)) {
      const url = new URL(input.url)
      url.pathname = withIngressPath(url.pathname, ingressPath)
      return nativeFetch(new Request(url, input), init)
    }
    return nativeFetch(input, init)
  }

  const nativePushState = window.history.pushState.bind(window.history)
  const nativeReplaceState = window.history.replaceState.bind(window.history)
  window.history.pushState = (data, unused, url) =>
    nativePushState(data, unused, typeof url === 'string' ? withIngressPath(url, ingressPath) : url)
  window.history.replaceState = (data, unused, url) =>
    nativeReplaceState(
      data,
      unused,
      typeof url === 'string' ? withIngressPath(url, ingressPath) : url
    )

  const nativeVisit = router.visit.bind(router)
  router.visit = (url, options) =>
    nativeVisit(typeof url === 'string' ? withIngressPath(url, ingressPath) : url, options)

  const rewriteTree = (root: ParentNode) => {
    for (const attribute of ['action', 'href', 'src'] as const) {
      if (root instanceof Element && root.hasAttribute(attribute))
        rewriteUrlAttribute(root, attribute)
      root
        .querySelectorAll(`[${attribute}^="/"]:not([${attribute}^="//"])`)
        .forEach((element) => rewriteUrlAttribute(element, attribute))
    }
  }

  rewriteTree(document)
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') {
        rewriteUrlAttribute(
          record.target as Element,
          record.attributeName as 'action' | 'href' | 'src'
        )
      } else {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) rewriteTree(node)
        })
      }
    }
  }).observe(document.documentElement, {
    attributeFilter: ['action', 'href', 'src'],
    attributes: true,
    childList: true,
    subtree: true,
  })
}
