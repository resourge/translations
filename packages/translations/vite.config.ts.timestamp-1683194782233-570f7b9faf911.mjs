// vite.config.ts
import react from "file:///Users/josesilvaoliveira/Desktop/Projects/packages/translations/node_modules/@vitejs/plugin-react-swc/index.mjs";

// ../../config/defineLibConfig.ts
import deepmerge from "file:///Users/josesilvaoliveira/Desktop/Projects/packages/translations/node_modules/@fastify/deepmerge/index.js";
import appRoot from "file:///Users/josesilvaoliveira/Desktop/Projects/packages/translations/node_modules/app-root-path/index.js";
import { readFileSync, readdirSync } from "fs";
import { globSync } from "file:///Users/josesilvaoliveira/Desktop/Projects/packages/translations/node_modules/glob/dist/mjs/index.js";
import { join, resolve } from "path";
import { defineConfig } from "file:///Users/josesilvaoliveira/Desktop/Projects/packages/translations/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/josesilvaoliveira/Desktop/Projects/packages/translations/node_modules/vite-plugin-dts/dist/index.mjs";
import viteTsconfigPaths from "file:///Users/josesilvaoliveira/Desktop/Projects/packages/translations/node_modules/vite-tsconfig-paths/dist/index.mjs";

// ../../package.json
var package_default = {
  name: "translations",
  version: "0.0.0-development",
  description: "",
  type: "module",
  scripts: {
    postinstall: "patch-package",
    commit: "git pull && git add . && git-cz",
    lint: 'eslint "./**/src/**/*.{ts,tsx}"',
    "lint:prod": "cross-env NODE_ENV=production npm run lint",
    "build:translations": "npm run build --prefix=./packages/translations",
    "build:react-translations": "npm run build --prefix=./packages/react-translations",
    build: "npm run build:translations && npm run build:react-translations",
    test: "npm run test --workspaces",
    "test:watch": "npm run test:watch --workspaces",
    coverage: "npm run coverage --workspaces",
    "semantic-release:translations": "npm run semantic-release --prefix=./packages/translations",
    "semantic-release:react-translations": "npm run semantic-release --prefix=./packages/react-translations",
    "semantic-release": "npm run semantic-release:translations && npm run semantic-release:react-translations"
  },
  author: "resourge",
  license: "MIT",
  workspaces: [
    "./packages/*",
    "!./packages/viteTranslationPlugin"
  ],
  devDependencies: {
    "@fastify/deepmerge": "1.3.0",
    "@semantic-release/changelog": "6.0.3",
    "@semantic-release/exec": "6.0.3",
    "@semantic-release/git": "10.0.1",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.3",
    "@types/node": "18.16.2",
    "app-root-path": "^3.1.0",
    c8: "7.13.0",
    "cross-env": "7.0.3",
    "cz-conventional-changelog": "3.3.0",
    eslint: "8.39.0",
    "eslint-config-react-app": "7.0.1",
    "eslint-config-standard-with-typescript": "34.0.1",
    "eslint-plugin-import": "2.27.5",
    "eslint-plugin-import-newlines": "1.3.1",
    "eslint-plugin-n": "15.7.0",
    "eslint-plugin-promise": "6.1.1",
    "eslint-plugin-react": "7.32.2",
    "eslint-plugin-react-hooks": "4.6.0",
    "eslint-plugin-testing-library": "5.10.3",
    "eslint-plugin-typescript-sort-keys": "2.3.0",
    glob: "10.2.2",
    "patch-package": "^7.0.0",
    "rollup-plugin-dts": "5.3.0",
    "semantic-release": "^21.0.2",
    "semantic-release-monorepo": "7.0.5",
    typescript: "4.9.5",
    vite: "4.3.2",
    "vite-plugin-dts": "2.3.0",
    "vite-tsconfig-paths": "^4.2.0",
    vitest: "0.30.1"
  },
  repository: {
    type: "git",
    url: "https://github.com/resourge/translations.git"
  },
  publishConfig: {
    access: "restricted"
  },
  config: {
    commitizen: {
      path: "./node_modules/cz-conventional-changelog"
    }
  }
};

// ../../config/defineLibConfig.ts
var { workspaces } = package_default;
var getWorkspaces = () => {
  return workspaces.filter((workspace) => !workspace.startsWith("!")).map((workspace) => {
    const root = join(appRoot.path, workspace.substring(1).replace(/\*/g, ""));
    return readdirSync(
      root,
      {
        withFileTypes: true
      }
    ).filter((dirent) => dirent.isDirectory()).map((dirent) => join(root, dirent.name));
  }).flat();
};
var packages = getWorkspaces().map(
  (workspace) => globSync(
    `${workspace}/**`
  ).filter((path) => path.includes("package.json")).map((path) => ({
    ...JSON.parse(
      readFileSync(path, "utf-8")
    ),
    path
  }))
).flat();
var packagesNames = packages.map((pack) => pack.name);
var entryLib = "./src/lib/index.ts";
var deepMerge = deepmerge();
var defineLibConfig = (config, afterBuild) => defineConfig((originalConfig) => deepMerge(
  typeof config === "function" ? config(originalConfig) : config,
  {
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts"
    },
    build: {
      minify: false,
      lib: {
        entry: entryLib,
        name: "index",
        fileName: "index",
        formats: ["cjs", "es"]
      },
      outDir: "./dist",
      rollupOptions: {
        output: {
          dir: "./dist"
        },
        external: [
          "tsconfig-paths",
          "typescript",
          "path",
          "fs",
          "vite",
          "react",
          "react/jsx-runtime"
        ]
      }
    },
    resolve: {
      preserveSymlinks: true,
      alias: originalConfig.mode === "development" ? packages.reduce((obj, { name, path }) => {
        obj[name] = resolve(path, `../${entryLib}`);
        return obj;
      }, {}) : {}
    },
    plugins: [
      viteTsconfigPaths(),
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
        bundledPackages: packagesNames,
        compilerOptions: {
          preserveSymlinks: true,
          paths: {}
        },
        afterBuild
      })
    ]
  }
));

// vite.config.ts
var vite_config_default = defineLibConfig({
  plugins: [react()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vLi4vY29uZmlnL2RlZmluZUxpYkNvbmZpZy50cyIsICIuLi8uLi9wYWNrYWdlLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvam9zZXNpbHZhb2xpdmVpcmEvRGVza3RvcC9Qcm9qZWN0cy9wYWNrYWdlcy90cmFuc2xhdGlvbnMvcGFja2FnZXMvdHJhbnNsYXRpb25zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvam9zZXNpbHZhb2xpdmVpcmEvRGVza3RvcC9Qcm9qZWN0cy9wYWNrYWdlcy90cmFuc2xhdGlvbnMvcGFja2FnZXMvdHJhbnNsYXRpb25zL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qb3Nlc2lsdmFvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3RyYW5zbGF0aW9ucy9wYWNrYWdlcy90cmFuc2xhdGlvbnMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcblxuaW1wb3J0IHsgZGVmaW5lTGliQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlnL2RlZmluZUxpYkNvbmZpZyc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVMaWJDb25maWcoe1xuXHRwbHVnaW5zOiBbcmVhY3QoKV1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9qb3Nlc2lsdmFvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3RyYW5zbGF0aW9ucy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qb3Nlc2lsdmFvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3RyYW5zbGF0aW9ucy9jb25maWcvZGVmaW5lTGliQ29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qb3Nlc2lsdmFvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3RyYW5zbGF0aW9ucy9jb25maWcvZGVmaW5lTGliQ29uZmlnLnRzXCI7aW1wb3J0IGRlZXBtZXJnZSBmcm9tICdAZmFzdGlmeS9kZWVwbWVyZ2UnXG5pbXBvcnQgYXBwUm9vdCBmcm9tICdhcHAtcm9vdC1wYXRoJ1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCByZWFkZGlyU3luYyB9IGZyb20gJ2ZzJ1xuaW1wb3J0IHsgZ2xvYlN5bmMgfSBmcm9tICdnbG9iJ1xuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyB0eXBlIFVzZXJDb25maWdFeHBvcnQsIGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcbmltcG9ydCB2aXRlVHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJ1xuXG5pbXBvcnQgUGFja2FnZUpzb24gZnJvbSAnLi4vcGFja2FnZS5qc29uJztcblxuY29uc3QgeyB3b3Jrc3BhY2VzIH0gPSBQYWNrYWdlSnNvbjtcblxuZXhwb3J0IGNvbnN0IGdldFdvcmtzcGFjZXMgPSAoKSA9PiB7XG5cdHJldHVybiB3b3Jrc3BhY2VzXG5cdC5maWx0ZXIoKHdvcmtzcGFjZSkgPT4gIXdvcmtzcGFjZS5zdGFydHNXaXRoKCchJykpXG5cdC5tYXAoKHdvcmtzcGFjZSkgPT4ge1xuXHRcdGNvbnN0IHJvb3QgPSBqb2luKGFwcFJvb3QucGF0aCwgd29ya3NwYWNlLnN1YnN0cmluZygxKS5yZXBsYWNlKC9cXCovZywgJycpKTtcblxuXHRcdHJldHVybiByZWFkZGlyU3luYyhcblx0XHRcdHJvb3QsIFxuXHRcdFx0e1xuXHRcdFx0XHR3aXRoRmlsZVR5cGVzOiB0cnVlIFxuXHRcdFx0fVxuXHRcdClcblx0XHQuZmlsdGVyKGRpcmVudCA9PiBkaXJlbnQuaXNEaXJlY3RvcnkoKSlcblx0XHQubWFwKGRpcmVudCA9PiBqb2luKHJvb3QsIGRpcmVudC5uYW1lKSlcblx0fSkuZmxhdCgpO1xufVxuXG5jb25zdCBwYWNrYWdlcyA9IGdldFdvcmtzcGFjZXMoKS5tYXAoKHdvcmtzcGFjZSkgPT4gXG5cdGdsb2JTeW5jKFxuXHRcdGAke3dvcmtzcGFjZX0vKipgXG5cdClcblx0LmZpbHRlcigocGF0aCkgPT4gcGF0aC5pbmNsdWRlcygncGFja2FnZS5qc29uJykpXG5cdC5tYXAoKHBhdGgpID0+ICh7XG5cdFx0Li4uSlNPTi5wYXJzZShcblx0XHRcdHJlYWRGaWxlU3luYyhwYXRoLCAndXRmLTgnKVxuXHRcdCksXG5cdFx0cGF0aFxuXHR9KSBhcyBjb25zdClcbilcbi5mbGF0KCk7XG5cbmNvbnN0IHBhY2thZ2VzTmFtZXMgPSBwYWNrYWdlcy5tYXAoKHBhY2spID0+IHBhY2submFtZSk7XG5cbmNvbnN0IGVudHJ5TGliID0gJy4vc3JjL2xpYi9pbmRleC50cyc7XG5cbmNvbnN0IGRlZXBNZXJnZSA9IGRlZXBtZXJnZSgpO1xuXG5leHBvcnQgY29uc3QgZGVmaW5lTGliQ29uZmlnID0gKFxuXHRjb25maWc6IFVzZXJDb25maWdFeHBvcnQsXG5cdGFmdGVyQnVpbGQ/OiAoKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD4pXG4pOiBVc2VyQ29uZmlnRXhwb3J0ID0+IGRlZmluZUNvbmZpZygob3JpZ2luYWxDb25maWcpID0+IGRlZXBNZXJnZShcblx0dHlwZW9mIGNvbmZpZyA9PT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZyhvcmlnaW5hbENvbmZpZykgOiBjb25maWcsXG5cdHtcblx0XHR0ZXN0OiB7XG5cdFx0XHRnbG9iYWxzOiB0cnVlLFxuXHRcdFx0ZW52aXJvbm1lbnQ6ICdqc2RvbScsXG5cdFx0XHRzZXR1cEZpbGVzOiAnLi9zcmMvc2V0dXBUZXN0cy50cydcblx0XHR9LFxuXHRcdGJ1aWxkOiB7XG5cdFx0XHRtaW5pZnk6IGZhbHNlLFxuXHRcdFx0bGliOiB7XG5cdFx0XHRcdGVudHJ5OiBlbnRyeUxpYixcblx0XHRcdFx0bmFtZTogJ2luZGV4Jyxcblx0XHRcdFx0ZmlsZU5hbWU6ICdpbmRleCcsXG5cdFx0XHRcdGZvcm1hdHM6IFsnY2pzJywgJ2VzJ11cblx0XHRcdH0sXG5cdFx0XHRvdXREaXI6ICcuL2Rpc3QnLFxuXHRcdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0XHRvdXRwdXQ6IHtcblx0XHRcdFx0XHRkaXI6ICcuL2Rpc3QnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGV4dGVybmFsOiBbXG5cdFx0XHRcdFx0J3RzY29uZmlnLXBhdGhzJywgJ3R5cGVzY3JpcHQnLCAncGF0aCcsIFxuXHRcdFx0XHRcdCdmcycsICd2aXRlJywgJ3JlYWN0Jyxcblx0XHRcdFx0XHQncmVhY3QvanN4LXJ1bnRpbWUnXG5cdFx0XHRcdF1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdHByZXNlcnZlU3ltbGlua3M6IHRydWUsXG5cdFx0XHRhbGlhczogb3JpZ2luYWxDb25maWcubW9kZSA9PT0gJ2RldmVsb3BtZW50JyA/IHBhY2thZ2VzLnJlZHVjZSgob2JqLCB7IG5hbWUsIHBhdGggfSkgPT4ge1xuXHRcdFx0XHRvYmpbbmFtZV0gPSByZXNvbHZlKHBhdGgsIGAuLi8ke2VudHJ5TGlifWApXG5cdFx0XHRcdHJldHVybiBvYmo7XG5cdFx0XHR9LCB7fSkgOiB7fVxuXHRcdH0sXG5cdFx0cGx1Z2luczogW1xuXHRcdFx0dml0ZVRzY29uZmlnUGF0aHMoKSxcblx0XHRcdGR0cyh7XG5cdFx0XHRcdGluc2VydFR5cGVzRW50cnk6IHRydWUsXG5cdFx0XHRcdHJvbGx1cFR5cGVzOiB0cnVlLFxuXHRcdFx0XHRidW5kbGVkUGFja2FnZXM6IHBhY2thZ2VzTmFtZXMsXG5cdFx0XHRcdGNvbXBpbGVyT3B0aW9uczoge1xuXHRcdFx0XHRcdHByZXNlcnZlU3ltbGlua3M6IHRydWUsXG5cdFx0XHRcdFx0cGF0aHM6IHt9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFmdGVyQnVpbGRcblx0XHRcdH0pXG5cdFx0XVxuXHR9XG4pKTtcbiIsICJ7XG4gIFwibmFtZVwiOiBcInRyYW5zbGF0aW9uc1wiLFxuICBcInZlcnNpb25cIjogXCIwLjAuMC1kZXZlbG9wbWVudFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwicG9zdGluc3RhbGxcIjogXCJwYXRjaC1wYWNrYWdlXCIsXG4gICAgXCJjb21taXRcIjogXCJnaXQgcHVsbCAmJiBnaXQgYWRkIC4gJiYgZ2l0LWN6XCIsXG4gICAgXCJsaW50XCI6IFwiZXNsaW50IFxcXCIuLyoqL3NyYy8qKi8qLnt0cyx0c3h9XFxcIlwiLFxuICAgIFwibGludDpwcm9kXCI6IFwiY3Jvc3MtZW52IE5PREVfRU5WPXByb2R1Y3Rpb24gbnBtIHJ1biBsaW50XCIsXG4gICAgXCJidWlsZDp0cmFuc2xhdGlvbnNcIjogXCJucG0gcnVuIGJ1aWxkIC0tcHJlZml4PS4vcGFja2FnZXMvdHJhbnNsYXRpb25zXCIsXG4gICAgXCJidWlsZDpyZWFjdC10cmFuc2xhdGlvbnNcIjogXCJucG0gcnVuIGJ1aWxkIC0tcHJlZml4PS4vcGFja2FnZXMvcmVhY3QtdHJhbnNsYXRpb25zXCIsXG4gICAgXCJidWlsZFwiOiBcIm5wbSBydW4gYnVpbGQ6dHJhbnNsYXRpb25zICYmIG5wbSBydW4gYnVpbGQ6cmVhY3QtdHJhbnNsYXRpb25zXCIsXG4gICAgXCJ0ZXN0XCI6IFwibnBtIHJ1biB0ZXN0IC0td29ya3NwYWNlc1wiLFxuICAgIFwidGVzdDp3YXRjaFwiOiBcIm5wbSBydW4gdGVzdDp3YXRjaCAtLXdvcmtzcGFjZXNcIixcbiAgICBcImNvdmVyYWdlXCI6IFwibnBtIHJ1biBjb3ZlcmFnZSAtLXdvcmtzcGFjZXNcIixcbiAgICBcInNlbWFudGljLXJlbGVhc2U6dHJhbnNsYXRpb25zXCI6IFwibnBtIHJ1biBzZW1hbnRpYy1yZWxlYXNlIC0tcHJlZml4PS4vcGFja2FnZXMvdHJhbnNsYXRpb25zXCIsXG4gICAgXCJzZW1hbnRpYy1yZWxlYXNlOnJlYWN0LXRyYW5zbGF0aW9uc1wiOiBcIm5wbSBydW4gc2VtYW50aWMtcmVsZWFzZSAtLXByZWZpeD0uL3BhY2thZ2VzL3JlYWN0LXRyYW5zbGF0aW9uc1wiLFxuICAgIFwic2VtYW50aWMtcmVsZWFzZVwiOiBcIm5wbSBydW4gc2VtYW50aWMtcmVsZWFzZTp0cmFuc2xhdGlvbnMgJiYgbnBtIHJ1biBzZW1hbnRpYy1yZWxlYXNlOnJlYWN0LXRyYW5zbGF0aW9uc1wiXG4gIH0sXG4gIFwiYXV0aG9yXCI6IFwicmVzb3VyZ2VcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwid29ya3NwYWNlc1wiOiBbXG4gICAgXCIuL3BhY2thZ2VzLypcIixcbiAgICBcIiEuL3BhY2thZ2VzL3ZpdGVUcmFuc2xhdGlvblBsdWdpblwiXG4gIF0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBmYXN0aWZ5L2RlZXBtZXJnZVwiOiBcIjEuMy4wXCIsXG4gICAgXCJAc2VtYW50aWMtcmVsZWFzZS9jaGFuZ2Vsb2dcIjogXCI2LjAuM1wiLFxuICAgIFwiQHNlbWFudGljLXJlbGVhc2UvZXhlY1wiOiBcIjYuMC4zXCIsXG4gICAgXCJAc2VtYW50aWMtcmVsZWFzZS9naXRcIjogXCIxMC4wLjFcIixcbiAgICBcIkB0ZXN0aW5nLWxpYnJhcnkvamVzdC1kb21cIjogXCJeNS4xNi41XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L3JlYWN0XCI6IFwiXjE0LjAuMFwiLFxuICAgIFwiQHRlc3RpbmctbGlicmFyeS91c2VyLWV2ZW50XCI6IFwiXjE0LjQuM1wiLFxuICAgIFwiQHR5cGVzL25vZGVcIjogXCIxOC4xNi4yXCIsXG4gICAgXCJhcHAtcm9vdC1wYXRoXCI6IFwiXjMuMS4wXCIsXG4gICAgXCJjOFwiOiBcIjcuMTMuMFwiLFxuICAgIFwiY3Jvc3MtZW52XCI6IFwiNy4wLjNcIixcbiAgICBcImN6LWNvbnZlbnRpb25hbC1jaGFuZ2Vsb2dcIjogXCIzLjMuMFwiLFxuICAgIFwiZXNsaW50XCI6IFwiOC4zOS4wXCIsXG4gICAgXCJlc2xpbnQtY29uZmlnLXJlYWN0LWFwcFwiOiBcIjcuMC4xXCIsXG4gICAgXCJlc2xpbnQtY29uZmlnLXN0YW5kYXJkLXdpdGgtdHlwZXNjcmlwdFwiOiBcIjM0LjAuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1pbXBvcnRcIjogXCIyLjI3LjVcIixcbiAgICBcImVzbGludC1wbHVnaW4taW1wb3J0LW5ld2xpbmVzXCI6IFwiMS4zLjFcIixcbiAgICBcImVzbGludC1wbHVnaW4tblwiOiBcIjE1LjcuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1wcm9taXNlXCI6IFwiNi4xLjFcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3RcIjogXCI3LjMyLjJcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtaG9va3NcIjogXCI0LjYuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi10ZXN0aW5nLWxpYnJhcnlcIjogXCI1LjEwLjNcIixcbiAgICBcImVzbGludC1wbHVnaW4tdHlwZXNjcmlwdC1zb3J0LWtleXNcIjogXCIyLjMuMFwiLFxuICAgIFwiZ2xvYlwiOiBcIjEwLjIuMlwiLFxuICAgIFwicGF0Y2gtcGFja2FnZVwiOiBcIl43LjAuMFwiLFxuICAgIFwicm9sbHVwLXBsdWdpbi1kdHNcIjogXCI1LjMuMFwiLFxuICAgIFwic2VtYW50aWMtcmVsZWFzZVwiOiBcIl4yMS4wLjJcIixcbiAgICBcInNlbWFudGljLXJlbGVhc2UtbW9ub3JlcG9cIjogXCI3LjAuNVwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIjQuOS41XCIsXG4gICAgXCJ2aXRlXCI6IFwiNC4zLjJcIixcbiAgICBcInZpdGUtcGx1Z2luLWR0c1wiOiBcIjIuMy4wXCIsXG4gICAgXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI6IFwiXjQuMi4wXCIsXG4gICAgXCJ2aXRlc3RcIjogXCIwLjMwLjFcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Jlc291cmdlL3RyYW5zbGF0aW9ucy5naXRcIlxuICB9LFxuICBcInB1Ymxpc2hDb25maWdcIjoge1xuICAgIFwiYWNjZXNzXCI6IFwicmVzdHJpY3RlZFwiXG4gIH0sXG4gIFwiY29uZmlnXCI6IHtcbiAgICBcImNvbW1pdGl6ZW5cIjoge1xuICAgICAgXCJwYXRoXCI6IFwiLi9ub2RlX21vZHVsZXMvY3otY29udmVudGlvbmFsLWNoYW5nZWxvZ1wiXG4gICAgfVxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWliLE9BQU8sV0FBVzs7O0FDQXZELE9BQU8sZUFBZTtBQUNsYSxPQUFPLGFBQWE7QUFDcEIsU0FBUyxjQUFjLG1CQUFtQjtBQUMxQyxTQUFTLGdCQUFnQjtBQUN6QixTQUFTLE1BQU0sZUFBZTtBQUM5QixTQUFnQyxvQkFBb0I7QUFDcEQsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sdUJBQXVCOzs7QUNQOUI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLGFBQWU7QUFBQSxFQUNmLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxJQUNULGFBQWU7QUFBQSxJQUNmLFFBQVU7QUFBQSxJQUNWLE1BQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLHNCQUFzQjtBQUFBLElBQ3RCLDRCQUE0QjtBQUFBLElBQzVCLE9BQVM7QUFBQSxJQUNULE1BQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLFVBQVk7QUFBQSxJQUNaLGlDQUFpQztBQUFBLElB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
