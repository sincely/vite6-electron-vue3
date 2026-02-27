import legacy from '@vitejs/plugin-legacy'

export default function legacyPlugin() {
  return legacy({
    additionalLegacyPolyfills: ['regenerator-runtime/runtime'] // 面向IE11时需要此插件
  })
}
