import { createContext, useContext, useLayoutEffect, useState } from 'react'
import i18n from '../i18n'
import defaultConfig from '../tenants/default.json'

const TenantContext = createContext(defaultConfig)

// Add new tenants here: hostname → dynamic import of their config
const TENANT_MAP = {
  'localhost': () => import('../tenants/localhost.json'),
  '127.0.0.1': () => import('../tenants/localhost.json'),
  'vivahbandhan.com': () => import('../tenants/vivahbandhan.com.json'),
  'www.vivahbandhan.com': () => import('../tenants/vivahbandhan.com.json'),
}

const COLOR_VAR_MAP = {
  primary: '--color-primary',
  primaryContainer: '--color-primary-container',
  onPrimary: '--color-on-primary',
  onPrimaryContainer: '--color-on-primary-container',
  primaryFixed: '--color-primary-fixed',
  primaryFixedDim: '--color-primary-fixed-dim',
  onPrimaryFixed: '--color-on-primary-fixed',
  onPrimaryFixedVariant: '--color-on-primary-fixed-variant',
  inversePrimary: '--color-inverse-primary',
  secondary: '--color-secondary',
  secondaryContainer: '--color-secondary-container',
  onSecondary: '--color-on-secondary',
  onSecondaryContainer: '--color-on-secondary-container',
  secondaryFixed: '--color-secondary-fixed',
  secondaryFixedDim: '--color-secondary-fixed-dim',
  onSecondaryFixed: '--color-on-secondary-fixed',
  onSecondaryFixedVariant: '--color-on-secondary-fixed-variant',
  tertiary: '--color-tertiary',
  tertiaryContainer: '--color-tertiary-container',
  onTertiary: '--color-on-tertiary',
  onTertiaryContainer: '--color-on-tertiary-container',
  tertiaryFixed: '--color-tertiary-fixed',
  tertiaryFixedDim: '--color-tertiary-fixed-dim',
  onTertiaryFixed: '--color-on-tertiary-fixed',
  onTertiaryFixedVariant: '--color-on-tertiary-fixed-variant',
  surface: '--color-surface',
  surfaceDim: '--color-surface-dim',
  surfaceBright: '--color-surface-bright',
  surfaceContainerLowest: '--color-surface-container-lowest',
  surfaceContainerLow: '--color-surface-container-low',
  surfaceContainer: '--color-surface-container',
  surfaceContainerHigh: '--color-surface-container-high',
  surfaceContainerHighest: '--color-surface-container-highest',
  surfaceVariant: '--color-surface-variant',
  onSurface: '--color-on-surface',
  onSurfaceVariant: '--color-on-surface-variant',
  inverseSurface: '--color-inverse-surface',
  inverseOnSurface: '--color-inverse-on-surface',
  outline: '--color-outline',
  outlineVariant: '--color-outline-variant',
  surfaceTint: '--color-surface-tint',
  background: '--color-background',
  onBackground: '--color-on-background',
  error: '--color-error',
  onError: '--color-on-error',
  errorContainer: '--color-error-container',
  onErrorContainer: '--color-on-error-container',
  shadowBtnPrimary: '--shadow-btn-primary',
  shadowBtnPrimaryHover: '--shadow-btn-primary-hover',
  shadowFloat: '--shadow-float',
}

function applyTenantConfig(config) {
  const root = document.documentElement
  Object.entries(config.colors).forEach(([key, value]) => {
    const cssVar = COLOR_VAR_MAP[key]
    if (cssVar) root.style.setProperty(cssVar, value)
  })
  document.title = `${config.name} — ${config.tagline}`
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) metaDesc.setAttribute('content', config.description)
  i18n.changeLanguage(config.locale)
  window.__TENANT_ID__ = config.tenantId
}

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(defaultConfig)

  useLayoutEffect(() => {
    const hostname = window.location.hostname
    const loader = TENANT_MAP[hostname]

    if (!loader) {
      applyTenantConfig(defaultConfig)
      return
    }

    loader()
      .then((mod) => {
        const config = mod.default
        applyTenantConfig(config)
        setTenant(config)
      })
      .catch(() => applyTenantConfig(defaultConfig))
  }, [])

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
}

export const useTenant = () => useContext(TenantContext)
