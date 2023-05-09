/* eslint-disable no-useless-escape */
import {
	type BaseTranslationsType,
	type SetupTranslationsConfig,
	type SetupTranslationsConfigLoad,
	type SetupTranslationsConfigTranslations,
	type TranslationsType
} from '@resourge/translations'
import { existsSync, mkdirSync, rmSync } from 'fs'
import path from 'path';
import { type ConfigLoaderSuccessResult } from 'tsconfig-paths';
import ts from 'typescript'
import { type PluginOption } from 'vite';

import { type ConvertTransIntoKeyStructure } from '@resourge/translations/src/lib/types/types';

import { find } from './utils/find';
import { type LoadConfig, tsConfig, watchMain } from './utils/watchMain';

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
	loadConfig: LoadConfig, 
	config: SetupTranslationsConfig<string> & 
	SetupTranslationsConfigTranslations<string, TranslationsType<string>> & 
	SetupTranslationsConfigLoad<BaseTranslationsType> & {
		keyStructure: ConvertTransIntoKeyStructure<string, TranslationsType<string>>
	}, 
	content: string, 
	localesFilePath: string,
	addWatchFile: (id: string) => void
) {
	if ( loadConfig.isJSON ) {
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
	else {
		return [
			'const importLanguages = {',
			...config.langs
			.map((language: string) => {
				const filePath = path.join(localesFilePath, `${language}.ts`)

				addWatchFile(filePath);

				return `${language}: () => import('${filePath.replace(/\\/g, '/')}'),`
			}),
			'};'
		].join('') + content
	}
}

export function viteTranslationPlugin(): PluginOption {
	const loadConfig: LoadConfig = {
		isJSON: false 
	};
	const projectPath = (tsConfig as ConfigLoaderSuccessResult).absoluteBaseUrl;

	const cacheOutDir = path.resolve(projectPath, '.cache');

	const localesFilePath = path.resolve(cacheOutDir, 'locales');

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
				content = content.replace(/(__translationsMethod__.*createTranslationEntry\(langKey\, translations\)\;)/g, '__translationsMethod__: (langKey, translations) => () => translations(langKey)')
			}

			if (!id.includes('node_modules') && setupRegex.test(content)) {
				const config = await watchMain(
					[id],
					loadConfig,
					path.join(cacheOutDir, 'src', id.split('src')[1].replace('ts', 'js')),
					localesFilePath,
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

				if ( config.translations ) {
					content = addImportLanguages(
						loadConfig,
						config,
						content,
						localesFilePath,
						this.addWatchFile
					);

					const result = ts.createSourceFile(
						id,
						content, 
						ts.ScriptTarget.ES2015
					);

					const setupTranslation = await find(result, (value) => value && value.expression && setupTranslations.includes(value.expression.escapedText))

					const translationFromSetup = await find(setupTranslation, (value) => value && value.name && value.name.escapedText === 'translations') as ts.Node | null
	
					if ( translationFromSetup ) {
						content = content.substring(
							0, 
							translationFromSetup.pos
						) + 
						`translations: async (language) => (await importLanguages[language]())${loadConfig.isJSON ? '' : '.default'}, keyStructure: ${JSON.stringify(config.keyStructure)}` + 
						content.substring(translationFromSetup.end);
					}
				}
			}
			
			return content
		}
	}
}
