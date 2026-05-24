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
// Note : we previously set `resolver.disableHierarchicalLookup = true`
// but expo-doctor (SDK 54) flags it as a mismatch. The default
// (hierarchical lookup ON) is required for NativeWind + Reanimated
// 4 to resolve their internal Node module deps via the standard
// node_modules walk.

module.exports = withNativeWind(config, { input: './global.css' })
