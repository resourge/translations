/// <reference types="vitest" />

import deepmerge from '@fastify/deepmerge';
import appRoot from 'app-root-path';
import { globSync } from 'glob';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type UserConfigExport } from 'vite';
import dts from 'vite-plugin-dts';

import PackageJson from '../package.json';

const { workspaces } = PackageJson;

export const getWorkspaces = () => {
	return workspaces
	.filter((workspace) => !workspace.startsWith('!'))
	.flatMap((workspace) => {
		const root = path.join(appRoot.path, workspace.slice(1).replaceAll('*', ''));

		return readdirSync(
			root, 
			{
				withFileTypes: true 
			}
		)
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => path.join(root, dirent.name));
	});
};

const packages = getWorkspaces().flatMap((workspace) => 
	globSync(
		`${workspace}/**`
	)
	.filter((path) => path.includes('package.json'))
	.map((path) => ({
		...JSON.parse(
			readFileSync(path, 'utf8')
		),
		path
	}) as const)
);

const packagesNames = packages
.map((pack) => pack.name)
.filter(Boolean);

const entryLib = './src/lib/index.ts';

const deepMerge = deepmerge();

export const defineLibConfig = (
	config: UserConfigExport,
	afterBuild?: ((fileName: string) => Promise<void> | void)
): UserConfigExport => {
	const generatedFiles = new Set<string>();
	return defineConfig((originalConfig) => deepMerge(
		typeof config === 'function'
			? config(originalConfig)
			: config,
		{
			build: {
				lib: {
					entry: entryLib,
					fileName: 'index',
					formats: ['cjs', 'es', 'umd'],
					name: 'index'
				},
				minify: false,
				outDir: './dist',
				rollupOptions: {
					external: [
						'tsconfig-paths', 'typescript', 'path', 
						'fs', 'vite', 'react', 'url',
						'react/jsx-runtime',
						'vue', 'find-package-json', 'import-sync'
					],
					output: {
						dir: './dist'
					}
				}
			},
			plugins: [
				dts({
					bundledPackages: packagesNames,
					compilerOptions: {
						baseUrl: '.'
					},
					insertTypesEntry: true,
					rollupTypes: true
				}),
				afterBuild
					? {
						apply: 'build',
						closeBundle() {
							generatedFiles
							.forEach((key) => {
								afterBuild(key);
							});
						},
						generateBundle(_options, bundle) {
							Object.keys(bundle)
							.forEach((key) => {
								generatedFiles.add(key);
							});
						},
						name: 'test'
					}
					: undefined
			],
			resolve: {
				preserveSymlinks: false,
				tsconfigPaths: true
			},
			test: {
				environment: 'jsdom',
				globals: true,
				setupFiles: './src/setupTests.ts'
			}
		}
	));
};
