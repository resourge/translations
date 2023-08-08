/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
	type BaseTranslationsType,
	type AsConst,
	type TranslationsKeys,
	type TranslationsType,
	createTranslationKeyStructure
} from '@resourge/translations'
import fs from 'fs';
import path from 'path';
import { loadConfig, createMatchPath } from 'tsconfig-paths';
import type { CompilerOptions } from 'typescript'
import ts from 'typescript';
import { fileURLToPath } from 'url';

import { type SetupTranslationsConfigTranslations, type SetupTranslationsConfig, type SetupTranslationsConfigLoad } from '@resourge/translations/src/lib/types/configTypes';
import { type ConvertTransIntoKeyStructure } from '@resourge/translations/src/lib/types/types';

export type LoadConfig = {
	/**
	 * By default it will separate into js files, activating this it will turn into JSON
	 * @default false
	 */
	isJSON: boolean
}

const createEntry = <Langs extends string, T extends TranslationsType<Langs>>(
	language: string,
	translations: AsConst<T>
): TranslationsKeys<Langs, T> => {
	return Object.keys(translations)
	.reduce((obj, key) => {
		const value = (translations as any)[key]
		const keyValues = Object.keys(value);

		if ( keyValues.includes(language) ) {
			const langValue: string = value[language];

			if ( /\{\{.*\}\}/g.test(langValue) ) {
				(obj as any)[key] = {
					type: 'function',
					test: `(params) => Utils.replaceParams('${langValue}', params)`
				}
			}
			else {
				(obj as any)[key] = langValue;
			}
		}
		else if ( value._custom ) {
			const { _custom, ...rest } = value;
			(obj as any)[key] = {
				type: 'function',
				test: `Utils.getCustomMethods('${_custom.name as string}', ${JSON.stringify(createEntry(language, rest))})`
			}
		}
		else if ( value ) {
			(obj as any)[key] = createEntry(language, value)
		}

		return obj;
	}, {} as TranslationsKeys<Langs, T>);
}

function createLanguages<
	Langs extends string, 
	T extends TranslationsType<Langs>
>(
	langs: Langs[],
	translations: AsConst<T>
) {
	return langs
	.reduce<Map<string, TranslationsKeys<Langs, T, undefined> | (() => Promise<TranslationsKeys<Langs, T, undefined>>)>>(
		(obj: Map<string, any>, langKey: string) => {
			obj.set(langKey, createEntry(langKey, translations))
			return obj
		}, 
	new Map()
	);
}

function stringify(obj: Record<string, any>) {
	let objString = '{';
	for (const key in obj) {
		const value = obj[key];
        
		objString += `"${key}":`;
        
		if (typeof value === 'object') {
			objString += value.type === 'function' ? (value.test as string) : `${stringify(value)}`;
		} 
		else if (typeof value === 'string') {
			objString += `"${value}"`;
		} 
		else if (typeof value === 'number') {
			objString += `${value}`;
		}
        
		// We add the comma
		objString += ',';
	}
	// We add the closing curly brace
	objString += '}';
	return objString;
}

export const tsConfig = loadConfig();

export function watchMain(
	fileNames: string[],
	loadConfig: LoadConfig,
	newTranslationFile: string, 
	localesFilePath: string,
	options: CompilerOptions
) {
	return new Promise<
		SetupTranslationsConfig<string> & 
		SetupTranslationsConfigTranslations<string, TranslationsType<string>> & 
		SetupTranslationsConfigLoad<BaseTranslationsType> & {
			keyStructure: ConvertTransIntoKeyStructure<string, TranslationsType<string>>
		}
	>((resolve, reject) => {
		const { outDir } = options;
		if ( tsConfig.resultType === 'failed' ) {
			reject(new Error());
			return;
		}

		const outDirPath = path.resolve(tsConfig.absoluteBaseUrl, outDir ?? '');
		const resolvePath = createMatchPath(
			outDirPath, 
			tsConfig.paths, 
			tsConfig.mainFields, 
			tsConfig.addMatchAll
		);

		function ThroughDirectory(Directory: string, Files: string[] = []) {
			fs.readdirSync(Directory).forEach(File => {
				const Absolute = path.join(Directory, File);
				if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute, Files);
				else return Files.push(Absolute);
			});

			return Files;
		}

		const host = ts.createWatchCompilerHost(
			fileNames,
			options,
			ts.sys,
			ts.createSemanticDiagnosticsBuilderProgram,
			undefined,
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			async (diagnostics) => {
				if (diagnostics.code !== 6031) {
					// TEMP
					const files = ThroughDirectory(outDirPath);

					files.forEach((filePath) => {
						const file = fs.readFileSync(filePath, 'utf-8');

						fs.writeFileSync(filePath, file.replace(/"(.{1,}\/(.*))(?<!js)"/g, '"$1.js"'))
					})

					// TEMP
					if ( !fs.existsSync(localesFilePath) ) {
						await fs.promises.mkdir(localesFilePath, {
							recursive: true 
						})
					}

					const { default: Translations, ...rest } = await import(`file://${newTranslationFile}?date=${new Date()
					.toISOString()}`);
					// TODO find config

					const { config } = (rest.TRANSLATION || rest.TranslationInstance);

					if ( config.translations ) {
						const languages = createLanguages(config.langs, config.translations);
						config.keyStructure = createTranslationKeyStructure(config.langs, config.translations);

						await Promise.all(
							Array.from(languages.entries())
							.map(async ([language, translations]) => {
								if ( loadConfig.isJSON ) {
									const filePath = path.join(localesFilePath, `${language}.json`)

									await fs.promises.writeFile(filePath, JSON.stringify(translations));
								}
								else {
									const filePath = path.join(localesFilePath, `${language}.ts`);

									const packagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './index.js').replaceAll('\\', '/')

									await fs.promises.writeFile(filePath, [
										`import { Utils } from '${packagePath}';`,
										`export default ${stringify(translations)}`
									].join(''));
								}
							})
						);
					}

					close();

					resolve(config);
				}
			},
			undefined,
			{
				watchFile: ts.WatchFileKind.PriorityPollingInterval
			}
		);

		const originalAfterProgramCreate = host.afterProgramCreate
		host.afterProgramCreate = builderProgram => {
			const originalEmit = builderProgram.emit
			builderProgram.emit = (targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers): ts.EmitResult => {
				const transformers = customTransformers ?? {
					before: [] 
				}
				if (!transformers.before) transformers.before = []
				transformers.before.push(
					(context) => {
						const { factory } = context;
						return (rootNode) => {
							return factory.updateSourceFile(
								rootNode,
								rootNode.statements.map((node: any) => {
									if (node.moduleSpecifier) {
										if (node.moduleSpecifier.text.includes('src')) {
											return factory.updateImportDeclaration(
												node,
												node.modifiers,
												node.importClause,
												factory.createStringLiteral(
													resolvePath(`${node.moduleSpecifier.text as string}.js`) ?? ''
												),
												node.assertClause
											)
										}
									}
									return node;
								})
							);
						}
					}
				)

				return originalEmit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, transformers)
			}
			if (originalAfterProgramCreate) originalAfterProgramCreate(builderProgram)
		}

		const { close } = ts.createWatchProgram(host);
	})
}
