const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// 웹(React 18)과 섞이지 않도록 react·react-native 는 앱 폴더의 한 벌로 고정한다
const pinned = ['react', 'react-native'];
const pinnedRoots = Object.fromEntries(
  pinned.map((name) => [name, path.dirname(require.resolve(`${ name }/package.json`, { paths: [projectRoot] }))]),
);

const upstreamResolve = config.resolver.resolveRequest;

// MathJax 설치본(assets/mathjax/tex-svg-full.txt)을 자산으로 번들한다
if (!config.resolver.assetExts.includes('txt')) config.resolver.assetExts.push('txt');

config.resolver.extraNodeModules ={ ...config.resolver.extraNodeModules, ...pinnedRoots };
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const name = pinned.find((p) => moduleName === p || moduleName.startsWith(`${ p }/`));
  const resolve = upstreamResolve ?? context.resolveRequest;
  if (name) {
    return resolve(
      { ...context, originModulePath: path.join(projectRoot, 'package.json') },
      moduleName,
      platform,
    );
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
