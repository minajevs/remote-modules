import { createAmdDefine } from './amd-registrator'
import { createDependencyResolver } from './dependency-resolver'
import { createSystem } from './system-registrator'

export type LoadOptions = {
  fetcher: (url: string) => Promise<string>
  dependencies: Record<string, any>
}

const defaultOptions: LoadOptions = {
  fetcher: url => fetch(url).then(res => res.text()),
  dependencies: {},
}

export const load = async <T = any>(url: string, options: Partial<LoadOptions> = {}) => {
  const { fetcher, dependencies } = { ...defaultOptions, ...options }
  const data = await fetcher(url)

  const resolver = createDependencyResolver(dependencies)

  const exports = {} as T
  const module = { exports }
  const system = createSystem(exports, resolver)
  const amdDefine = createAmdDefine(resolver, exports, dependencies)

  const func = new Function('require', 'module', 'exports', 'System', 'define', data)
  func(resolver, module, exports, system, amdDefine)

  return module.exports
}
