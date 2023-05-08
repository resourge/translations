/* eslint-disable no-useless-escape */
import { SetupReactTranslation } from '@resourge/react-translations'
import { SetupTranslations } from '@resourge/translations'
import path from 'path';
import { type ConfigLoaderSuccessResult } from 'tsconfig-paths';
import ts, {
	type CallExpression,
	type Identifier,
	type ObjectLiteralExpressionBase,
	type PropertyAssignment
} from 'typescript'
import { type PluginOption } from 'vite';

import { type LoadConfig, tsConfig, watchMain } from './utils/watchMain';

const {
	ModuleKind,
	ModuleResolutionKind,
	ScriptTarget
} = ts;

const setupRegex = new RegExp(`(${SetupTranslations.name}|${SetupReactTranslation.name}|SetupVueTranslation)\(([\s\S]*?)\)`, 'g')

export function viteTranslationPlugin(): PluginOption {
	const loadConfig: LoadConfig = {
		isJSON: false 
	};
	const translationFilePath = './src/TRANSLATIONS.ts'
	const projectPath = (tsConfig as ConfigLoaderSuccessResult).absoluteBaseUrl;

	const cacheOutDir = path.resolve(projectPath, '.cache');

	const newTranslationFile = path.join(cacheOutDir, translationFilePath.replace('.ts', '.js'))
	const localesFilePath = path.resolve(cacheOutDir, 'locales')

	return {
		name: 'i18nLocalesLoad',
		apply: 'build',
		transform: async function (content: string, id: string) {
			if ( content.includes('__translationsMethod__') ) {
				content = content.replace(/(__translationsMethod__.*createTranslationEntry\(langKey\, translations\)\;)/g, '__translationsMethod__: (langKey, translations) => () => translations(langKey)')
			}
			if ( setupRegex.test(content) ) {
				const config = await watchMain(
					[id],
					loadConfig,
					newTranslationFile,
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
						allowSyntheticDefaultImports: true
					}
				);

				// fs.rmdirSync(cacheOutDir, { recursive: true })

				if ( config.translations ) {
					if ( loadConfig.isJSON ) {
						content = [
							...config.langs
							.map((language: string) => {
								const filePath = path.join(localesFilePath, `${language}.json`)

								this.addWatchFile(filePath);

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
						content = [
							'const importLanguages = {',
							...config.langs
							.map((language: string) => {
								const filePath = path.join(localesFilePath, `${language}.ts`)

								this.addWatchFile(filePath);

								return `${language}: () => import('${filePath.replace(/\\/g, '/')}'),`
							}),
							'};'
						].join('') + content
					}

					if ( content.includes('__translationsKeyStructure__') ) {
						content = content.replace(/(__translationsKeyStructure__.*createTranslationKeyStructure\(langKey\, translations\)\;)/g, `__translationsKeyStructure__: (langKey, translations) => ${JSON.stringify(config.keyStructure)}`)
					}

					const result = ts.createSourceFile(
						id,
						content, 
						ts.ScriptTarget.ES2015
					);

					const findByEscapedText = (result: Identifier, escapedText: string): any => {
						if ( 
							result && (
								result.escapedText === escapedText || 
								( 
									(result as unknown as PropertyAssignment).name as Identifier
								)?.escapedText === escapedText 
							)
						) {
							return result;
						}
						
						return ts.forEachChild(result, (n) => findByEscapedText(n as Identifier, escapedText))
					}

					const getProperty = (argument?: ts.Expression): PropertyAssignment | undefined => {
						if ( argument ) {
							const property = (argument as ObjectLiteralExpressionBase<PropertyAssignment>).properties.find((property) => (property.name as Identifier)?.escapedText === 'translations')
							if ( property ) {
								return property
							}
						}
					}

					const getTranslationFromSetupTranslation = (result: ts.Node) => {
						try {
							const get = (node: ts.Node): any => {
								if ( 
									node.kind === ts.SyntaxKind.CallExpression &&
									((node as CallExpression).expression as Identifier).escapedText === 'SetupTranslations'
								) {
									const argument = (node as CallExpression).arguments.find((argument) => argument.kind === ts.SyntaxKind.ObjectLiteralExpression);

									if ( argument ) {
										const property = (argument as ObjectLiteralExpressionBase<PropertyAssignment>).properties.find((property) => (property.name as Identifier)?.escapedText === 'translations')
										if ( property ) {
											return property
										}
									}
									else {
										const variable = (node as CallExpression).arguments[0] as Identifier;

										return getProperty(findByEscapedText(result as Identifier, variable.escapedText as any)?.initializer)
									}
								}
								return ts.forEachChild(node, (n) => get(n))
							}

							return get(result);
						}
						catch ( e ) {
							return undefined;
						}
					}

					const translationFromSetup = await getTranslationFromSetupTranslation(result);

					if ( translationFromSetup ) {
						content = content.substring(0, translationFromSetup.pos) + `translations: async (language) => (await importLanguages[language]())${loadConfig.isJSON ? '' : '.default'}` + content.substring(translationFromSetup.end);
					}
				}
			}
			
			return content
		}
	}
}
