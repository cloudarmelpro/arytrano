// Metro config — NativeWind + monorepo (@arytrano/shared)
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('node:path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Tell Metro where the workspace packages live so `@arytrano/shared`
// resolves correctly through the file: link in package.json.
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
// Hoisting safety : disable symlinks (NativeWind has historical
// issues with symlinks on Windows; we use file: links instead).
config.resolver.disableHierarchicalLookup = true

module.exports = withNativeWind(config, { input: './global.css' })
