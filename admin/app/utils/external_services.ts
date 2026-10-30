import { SERVICE_NAMES } from '../../constants/service_names.js'

type Environment = Record<string, string | undefined>

export type ExternalService = {
  serviceName: string
  internalUrl: string
  publicUrl: string
}

export function getExternalServices(environment: Environment = process.env): ExternalService[] {
  if (environment.NOMAD_PLATFORM !== 'haos') return []

  const internalUrl = environment.NOMAD_KIWIX_URL?.trim()
  const publicUrl = environment.NOMAD_KIWIX_PUBLIC_URL?.trim()
  if (!internalUrl || !publicUrl) return []

  return [
    {
      serviceName: SERVICE_NAMES.KIWIX,
      internalUrl,
      publicUrl,
    },
  ]
}

export function getExternalService(
  serviceName: string,
  environment: Environment = process.env
): ExternalService | undefined {
  return getExternalServices(environment).find((service) => service.serviceName === serviceName)
}
