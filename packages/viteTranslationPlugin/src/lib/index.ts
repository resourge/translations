/* eslint-disable no-useless-escape */
import { existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
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

const setupTranslations = [
	setupTranslationsName,
	setupReactTranslationsName,
	setupVueTranslationsName
]

const setupRegex = new RegExp(`(${setupTranslationsName}|${setupReactTranslationsName}|${setupVueTranslationsName})\\(([\\s\\S]*?)\\)`, 'g')

function addImportLanguages(
	_loadConfig: LoadConfig, 
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

			return `'${language}': () => import('${filePath.replace(/\\/g, '/')}'),`
		}),
		'};'
	].join('') + content
	// }
}

export function viteTranslationPlugin(): PluginOption {
	const loadConfig: LoadConfig = {
		isJSON: false 
	};
	
	const projectPath = (tsConfig as ConfigLoaderSuccessResult).configFileAbsolutePath.replace('tsconfig.json', '');

	const cacheOutDir = path.resolve(projectPath, '.cache');

	return {
		name: 'i18nLocalesLoad',
		apply: 'build',
		buildStart: () => {
			if ( !existsSync(cacheOutDir) ) {
				mkdirSync(cacheOutDir)
			}
		},
		buildEnd: () => {
			rmSync(cacheOutDir, {
				recursive: true,
				force: true 
			})
		},
		transform: async function (content: string, id: string) {
			if ( content.includes('__translationsMethod__') ) {
				content = content.replace(/__translationsMethod__.*createTranslationEntry\(langKey\, translations\)/g, '__translationsMethod__: (langKey, translations) => () => translations(langKey)')
			}

			if (!id.includes('node_modules') && setupRegex.test(content)) {
				const newId = id.split('src');
				const result = await watchMain(
					[id],
					path.join(cacheOutDir, 'src', newId[newId.length - 1].replace('.ts', '.js')),
					{
						noEmitOnError: false,
						noImplicitAny: true,
						target: ScriptTarget.ES2016,
						module: ModuleKind.ES2020,
						moduleResolution: ModuleResolutionKind.NodeJs,
						outDir: cacheOutDir,
						baseUrl: path.resolve(projectPath, './'),
						rootDir: path.resolve(projectPath, './'),
						types: ['vite/client'],
						paths: (tsConfig as ConfigLoaderSuccessResult).paths,
						allowSyntheticDefaultImports: true,
						allowJs: true
					}
				);

				if ( result?.config.translations ) {
					content = addImportLanguages(
						loadConfig,
						result,
						content,
						this.addWatchFile
					);

					const sourceFile = ts.createSourceFile(
						id,
						content, 
						ts.ScriptTarget.ES2015
					);

					const setupTranslation = await find(sourceFile, (value) => value && value.expression && setupTranslations.includes(value.expression.escapedText))

					const translationFromSetup = await find(setupTranslation, (value) => value && value.name && value.name.escapedText === 'translations') as ts.Node | null
	
					if ( translationFromSetup ) {
						content = content.substring(
							0, 
							translationFromSetup.pos
						) + 
						`translations: async (language) => (await importLanguages[language]())${loadConfig.isJSON ? '' : '.default'}, keyStructure: ${JSON.stringify(result.config.keyStructure)}` + 
						content.substring(translationFromSetup.end);
					}
				}
			}
			
			return content
		}
	}
}
