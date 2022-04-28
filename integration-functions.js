import fs from 'fs';
import path from 'path';

export function getAdapter() {
  return {
    name: 'astro-firebase',
    serverEntrypoint: 'astro-firebase/firebase-functions.js',
    exports: ['handler'],
    args: {},
  };
}

function firebaseFunctions({ packageJson } = {}) {
  let _config;
  return {
    name: 'astro-firebase',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        config.outDir = new URL('./functions/', config.root);
        updateConfig({
          vite: { ssr: { external: 'firebase-functions' } }
        });
      },
      'astro:config:done': ({ config, setAdapter }) => {
        setAdapter(getAdapter());
        _config = config;
      },
      'astro:build:start': async ({ buildConfig }) => {
        buildConfig.serverEntry = 'index.js';
        buildConfig.server = _config.outDir;
      },
      'astro:build:done': async ({ routes, dir }) => {      
        const rewrites = [];
        let firebaseJson;
        const firebaseJsonURL = path.join(process.cwd(), 'firebase.json');

        try {
          const firebaseJsonString = fs.readFileSync(firebaseJsonURL, { encoding: 'utf-8' });
          firebaseJson = JSON.parse(firebaseJsonString);
        } catch {
          firebaseJson = {}
        }

        for (const route of routes) {
          if (route.pathname) {
            rewrites.push({
              source: route.pathname,
              function: 'handler'
            });
          } else {
            const pattern = '/' + route.segments.map(([part]) => (part.dynamic ? '*' : part.content)).join('/');
            rewrites.push({
              source: pattern,
              function: 'handler'
            });
          }
        }

        if('hosting' in firebaseJson) {
          if('rewrites' in firebaseJson.hosting) {
            firebaseJson.hosting.rewrites = firebaseJson.hosting.rewrites.filter(i => i?.function !== 'handler');
            firebaseJson.hosting.rewrites.push(...rewrites);
          } else {
            firebaseJson.hosting.rewrites = rewrites;
          }
        } else {
          firebaseJson.hosting = { rewrites };
        }

        firebaseJson.hosting = {
          public: 'functions/client',
          ...firebaseJson.hosting
        }

        fs.writeFileSync(firebaseJsonURL, JSON.stringify(firebaseJson, null, 2));
        

        const pkgJsonPath = path.join(process.cwd(), 'package.json')
        const pkgJsonString = fs.readFileSync(pkgJsonPath, { encoding: 'utf-8' });
        const pkgJson = JSON.parse(pkgJsonString);

        fs.writeFileSync(new URL('./package.json', _config.outDir), JSON.stringify({
          type: "module", 
          engines: {
            node: '16'
          },
          dependencies: {
            'firebase-functions': '^3.20.1',
            'astro': '^1.0.0-beta.19',
            ...pkgJson.dependencies,
          },
          ...packageJson
        }, null, 2));
      },
    },
  };
}

export { firebaseFunctions, firebaseFunctions as default };