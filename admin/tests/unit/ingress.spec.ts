import assert from 'node:assert/strict'
import test from 'node:test'
import { parseIngressPath, prefixIngressUrl, rewriteIngressHtml } from '../../app/utils/ingress.js'
import {
  getAppPathname,
  getIngressPath,
  withIngressOrigin,
  withIngressPath,
} from '../../inertia/lib/ingress_path.js'

const ingressPath = '/api/hassio_ingress/recovery-check'

test('accepts only Home Assistant ingress paths', () => {
  assert.equal(parseIngressPath(ingressPath), ingressPath)
  assert.equal(parseIngressPath('/api/hassio_ingress/a_b-C9'), '/api/hassio_ingress/a_b-C9')
  assert.equal(parseIngressPath('/api/hassio_ingress/token/extra'), null)
  assert.equal(parseIngressPath('//example.com'), null)
  assert.equal(parseIngressPath(undefined), null)
})

test('prefixes local URLs without changing direct or external URLs', () => {
  assert.equal(prefixIngressUrl('/home', ingressPath), `${ingressPath}/home`)
  assert.equal(
    prefixIngressUrl('/pmtiles/world.pmtiles', ingressPath),
    `${ingressPath}/pmtiles/world.pmtiles`
  )
  assert.equal(prefixIngressUrl(`${ingressPath}/home`, ingressPath), `${ingressPath}/home`)
  assert.equal(prefixIngressUrl('https://example.com', ingressPath), 'https://example.com')
  assert.equal(prefixIngressUrl('//example.com', ingressPath), '//example.com')
})

test('rewrites initial HTML assets and Inertia page URL', () => {
  const html =
    '<link href="/assets/app.css"><img src="/nomad.svg"><form action="/api/upload"><div data-page="{&quot;url&quot;:&quot;/home&quot;}"></div>'
  assert.equal(
    rewriteIngressHtml(html, ingressPath),
    `<link href="${ingressPath}/assets/app.css"><img src="${ingressPath}/nomad.svg"><form action="${ingressPath}/api/upload"><div data-page="{&quot;url&quot;:&quot;${ingressPath}/home&quot;}"></div>`
  )
})

test('keeps navigation, uploads, downloads, SSE, and map requests under ingress', () => {
  assert.equal(getIngressPath(`${ingressPath}/settings/maps`), ingressPath)
  assert.equal(getAppPathname(`${ingressPath}/settings/maps`), '/settings/maps')
  assert.equal(getAppPathname('/settings/maps'), '/settings/maps')
  assert.equal(withIngressPath('/api/status', ingressPath), `${ingressPath}/api/status`)
  assert.equal(
    withIngressPath('/__transmit/events', ingressPath),
    `${ingressPath}/__transmit/events`
  )
  assert.equal(withIngressPath('/api/zim/upload', ingressPath), `${ingressPath}/api/zim/upload`)
  assert.equal(
    withIngressPath('/api/rag/files/download?source=manual.pdf', ingressPath),
    `${ingressPath}/api/rag/files/download?source=manual.pdf`
  )
  assert.equal(withIngressPath('/api/maps/styles', ingressPath), `${ingressPath}/api/maps/styles`)
  assert.equal(withIngressPath('/api/status', ''), '/api/status')
})

test('rewrites same-origin absolute URLs without changing direct or Kiwix links', () => {
  const origin = 'http://homeassistant.local:8088'
  assert.equal(
    withIngressOrigin(`${origin}/api/maps/styles`, ingressPath, origin),
    `${origin}${ingressPath}/api/maps/styles`
  )
  assert.equal(
    withIngressOrigin('http://homeassistant.local:8111/wiki/', ingressPath, origin),
    'http://homeassistant.local:8111/wiki/'
  )
  assert.equal(withIngressOrigin('https://kiwix.org/', ingressPath, origin), 'https://kiwix.org/')
})
