import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { getExternalService, getExternalServices } from '../../app/utils/external_services.js'

test('does not expose external services outside HAOS mode', () => {
  assert.deepEqual(
    getExternalServices({
      NOMAD_PLATFORM: 'docker',
      NOMAD_KIWIX_URL: 'http://kiwix:8111/wiki/',
      NOMAD_KIWIX_PUBLIC_URL: 'http://homeassistant.local:8111/',
    }),
    []
  )
})

test('requires both internal and public Kiwix URLs', () => {
  assert.deepEqual(getExternalServices({ NOMAD_PLATFORM: 'haos' }), [])
  assert.deepEqual(
    getExternalServices({
      NOMAD_PLATFORM: 'haos',
      NOMAD_KIWIX_URL: 'http://kiwix:8111/wiki/',
    }),
    []
  )
})

test('describes externally managed Kiwix in HAOS mode', () => {
  const environment = {
    NOMAD_PLATFORM: 'haos',
    NOMAD_KIWIX_URL: 'http://kiwix:8111/wiki/',
    NOMAD_KIWIX_PUBLIC_URL: 'http://homeassistant.local:8111/',
  }

  assert.deepEqual(getExternalService('nomad_kiwix_server', environment), {
    serviceName: 'nomad_kiwix_server',
    internalUrl: 'http://kiwix:8111/wiki/',
    publicUrl: 'http://homeassistant.local:8111/',
  })
})
