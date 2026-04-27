/* eslint-disable no-useless-escape */
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { type ConfigLoaderSuccessResult } from 'tsconfig-paths';
import ts from 'typescript';
import { type PluginOption } from 'vite';

import { find } from './utils/find';
import {
	type LoadConfig,
	tsConfig,
	watchMain,
	type WatchMainResultType
} from './utils/watchMain';

const {
	ModuleKind,
	ModuleResolutionKind,
	ScriptTarget
} = ts;

const setupTranslationsName: string = 'SetupTranslations';
const setupReactTranslationsName: string = 'SetupReactTranslations';
const setupVueTranslationsName: string = 'SetupVueTranslations';

const setupTranslations = new Set([
	setupReactTranslationsName,
	setupTranslationsName,
	setupVueTranslationsName
]);

const setupRegex = new RegExp(String.raw`(${setupTranslationsName}|${setupReactTranslationsName}|${setupVueTranslationsName})\(([\s\S]*?)\)`, 'g');

export function viteTranslationPlugin(): PluginOption {
	const loadConfig: LoadConfig = {
		isJSON: false 
	};
	
	const projectPath = (tsConfig as ConfigLoaderSuccessResult).configFileAbsolutePath.replace('tsconfig.json', '');

	const cacheOutDir = path.resolve(projectPath, '.cache');

	return {
		apply: 'build',
		buildEnd: () => {
			rmSync(cacheOutDir, {
				force: true,
				recursive: true 
			});
		},
		buildStart: () => {
			if ( !existsSync(cacheOutDir) ) {
				mkdirSync(cacheOutDir);
			}
		},
		name: 'i18nLocalesLoad',
		transform: async function (content: string, id: string) {
			if ( content.includes('__translationsMethod__') ) {
				content = content.replaceAll(/__translationsMethod__.*createTranslationEntry\(langKey\, translations\)/g, '__translationsMethod__: (langKey, translations) => () => translations(langKey)');
			}

			if (!id.includes('node_modules') && setupRegex.test(content)) {
				const newId = id.split('src');
				const result = await watchMain(
					[id],
					path.join(cacheOutDir, 'src', newId.at(-1)?.replace('.ts', '.js') ?? ''),
					{
						allowJs: true,
						allowSyntheticDefaultImports: true,
						baseUrl: path.resolve(projectPath, './'),
						module: ModuleKind.ES2020,
						moduleResolution: ModuleResolutionKind.NodeJs,
						noEmitOnError: false,
						noImplicitAny: true,
						outDir: cacheOutDir,
						paths: (tsConfig as ConfigLoaderSuccessResult).paths,
						rootDir: path.resolve(projectPath, './'),
						target: ScriptTarget.ES2016,
						types: ['vite/client']
					}
				);

				if ( result?.config.translations ) {
					content = addImportLanguages(
						result,
						content,
						this.addWatchFile
					);

					const sourceFile = ts.createSourceFile(
						id,
						content, 
						ts.ScriptTarget.ES2015
					);

					const setupTranslation = await find(sourceFile, (value) => value && value.expression && setupTranslations.has(value.expression.escapedText));

					const translationFromSetup = await find(setupTranslation, (value) => value && value.name && value.name.escapedText === 'translations') as null | ts.Node;
	
					if ( translationFromSetup ) {
						content = content.slice(
							0, 
							Math.max(0, translationFromSetup.pos)
						) 
						+ `translations: async (language) => (await importLanguages[language]())${loadConfig.isJSON
							? ''
							: '.default'}, keyStructure: ${JSON.stringify(result.config.keyStructure)}` 
							+ content.slice(Math.max(0, translationFromSetup.end));
					}
				}
			}
			
			return content;
		}
	};
}

function addImportLanguages(
	result: WatchMainResultType,
	content: string, 
	addWatchFile: (id: string) => void
) {
	/* if ( loadConfig.isJSON ) {
		return [
			...config.langs
			.map((language: string) => {
				const filePath = path.join(localesFilePath, `${language}.json`)

				addWatchFile(filePath);

				return `import ${language}Url from "${filePath.replace(/\\/g, '/')}?url";`;
			}),
			'const importLanguages = {',
			...config.langs
			.map((language: string) => {
				return `${language}: () => fetch(${language}Url).then((result) => result.json()),`
			}),
			'};'
		].join('') + content
	}
	else { */
	return [
		'const importLanguages = {',
		...result.languageFiles
		.map(({ filePath, language }) => {
			addWatchFile(filePath);

			return `'${language}': () => import('${filePath.replaceAll('\\', '/')}'),`;
		}),
		'};'
	].join('') + content;
	// }
}
