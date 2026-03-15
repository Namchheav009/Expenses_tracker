declare global {
  var route: any
}

// Simple fallback route helper
if (typeof window !== 'undefined') {
  globalThis.route = ((name: string, params?: any) => {
    if (params) {
      return `/${name}/${Object.values(params).join('/')}`
    }
    return `/${name}`
  }) as any
}

export const route = globalThis.route || ((name: string) => `/${name}`)
