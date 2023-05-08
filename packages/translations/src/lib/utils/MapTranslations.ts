/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type OnlyNestedKeyOf } from '../types/FormKey';
import type {
	BaseTranslationsKeys,
	BaseTranslationsType,
	Narrow,
	TranslationsKeys,
	TranslationsType
} from '../types/TranslationTypes'
import type {
	OnTranslationGet,
	OnTranslationSet,
	SetupConfig,
	SetupTranslationsConfigLoad,
	SetupTranslationsConfigTranslations,
	TranslationObj
} from '../types/configTypes'
import {
	type ConvertTransIntoKeyStructure,
	type ConvertTransIntoSimpleObj,
	type TFunctionReturn,
	type TFunctionValues
} from '../types/types'

import { createProxy } from './createProxy';
import { createTranslationEntry } from './createTranslationEntry';
import { createTranslationKeyStructure } from './createTranslationKeyStructure';
import { deepValue, isExpired } from './utils';

function flattenObject<B extends BaseTranslationsType>(structure: Narrow<B>, prefix: string = ''): Record<string, string> {
	return Object.keys(structure)
	.reduce<Record<string, string>>((acc, k) => {
		const pre = prefix.length ? prefix + '.' : '';
		const value = (structure as BaseTranslationsType)[k] as BaseTranslationsType;
		if (typeof value === 'object') {
			return {
				...acc,
				...flattenObject(value, pre + k)
			}
		}
		else {
			acc[pre + k] = value
		};
		return acc;
	}, {});
}

export type LangMapTranslationObj<
	Langs extends string,
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = {
	lastTranslation: number
	translations: Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans>
}

export type LangMaps< 
	Langs extends string,
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = Map<
	Langs, 
	LangMapTranslationObj<Langs, Trans>
> & Map<
	'request', 
	((language: string) => Promise<BaseTranslationsKeys<Trans>>)
>

const translationMethod = {
	__translationsMethod__: <Langs extends string, T extends TranslationsType<Langs>>(
		langKey: string, 
		translations: T | ((lang: string) => Promise<T>)
	) => createTranslationEntry(langKey, translations as Narrow<T>),
	__translationsKeyStructure__: <
		Langs extends string, 
		T extends TranslationsType<Langs> | BaseTranslationsType
	>(
		langs: Langs[],
		translations: T
	) => createTranslationKeyStructure(langs, translations)
}

function createLanguages<
	Langs extends string, 
	T extends TranslationsType<Langs>
>(
	langs: Langs[],
	translations: Narrow<T> | ((lang: string) => Promise<Narrow<T>>)
) {
	return {
		keyStructure: translationMethod.__translationsKeyStructure__(langs, translations as T),
		langMaps: langs
		.reduce<
			LangMaps<Langs, T>
		>(
			(obj: LangMaps<Langs, T>, langKey: string) => {
				obj.set(
					langKey as Langs, 
					{
						translations: translationMethod.__translationsMethod__(langKey, translations as T) as any,
						lastTranslation: Date.now()
					}
				);

				return obj
			}, 
			new Map()
		)
	} as const;
}

export class MapTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> {
	public langMaps: LangMaps<Langs, Trans> = new Map();
	public isLoad: boolean = false;

	public structure: Trans & Record<string, string> = {} as Trans & Record<string, string>;
	public keyStructure: ConvertTransIntoKeyStructure<Langs, Trans> = {} as ConvertTransIntoKeyStructure<Langs, Trans>;

	public lastMissingKey: number = 0;

	public t!: <Key extends OnlyNestedKeyOf<ConvertTransIntoSimpleObj<Langs, Trans>> | string>(
		...args: string extends Key 
			? [
				key: string,
				value?: Record<string, any>
			]
			: (
				TFunctionValues<
						Trans extends TranslationsType<Langs> 
							? TranslationsKeys<Langs, Trans> 
							: BaseTranslationsKeys<Trans>, 
						Key
					> extends undefined 
					? [key: Narrow<Key>] 
					: [
						key: Narrow<Key>,
						values: TFunctionValues<
							Trans extends TranslationsType<Langs> 
								? TranslationsKeys<Langs, Trans> 
								: BaseTranslationsKeys<Trans>, 
							Key
						>
					]
			)
	) => TFunctionReturn<Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans>, Key>;

	constructor(
		public config: SetupConfig<Langs, Trans>,
		public onTranslationGets: Array<OnTranslationGet<Langs, Trans>>,
		public onTranslationSets: Array<OnTranslationSet<Langs, Trans>>,
		onMissingKeyRequest: () => void
	) {
		const _translationConfig = (config as unknown as SetupTranslationsConfigTranslations<Langs, Trans extends TranslationsType<Langs> ? Trans : TranslationsType<Langs>>);
		const _loadConfig = (config as unknown as SetupTranslationsConfigLoad<Trans extends BaseTranslationsType ? Trans : BaseTranslationsType>);
		if ( _translationConfig.translations ) {
			const { keyStructure, langMaps } = createLanguages<Langs, Trans extends TranslationsType<Langs> ? Trans : TranslationsType<Langs>>(
				config.langs as Langs[], 
				_translationConfig.translations
			);

			this.keyStructure = keyStructure as unknown as ConvertTransIntoKeyStructure<Langs, Trans>
			this.langMaps = langMaps as unknown as LangMaps<Langs, Trans>

			this.t = (
				key: any,
				values?: Record<string, any>
			) => {
				const translations = this.get(this.config.language) as Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans, undefined> : BaseTranslationsKeys<Trans, undefined>;

				const keyValue = key.includes('.') ? deepValue(translations, key) : translations[key];

				const value = values && typeof keyValue === 'function' 
					? ((keyValue as (params: any) => string)(values) as any)
					: (keyValue as any)

				return value || key
			};
		}
		else if ( _loadConfig.load ) {
			this.isLoad = true;

			this.t = (
				key: any,
				values?: Record<string, any>
			) => {
				const translations = this.get(this.config.language) as Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans, undefined> : BaseTranslationsKeys<Trans, undefined>;

				const keyValue = translations[key];

				const value = values && typeof keyValue === 'function' 
					? ((keyValue as (params: any) => string)(values) as any)
					: (keyValue as any)

				return value || key
			};

			this.structure = {
				...(_loadConfig.load.structure as Trans),
				...flattenObject(_loadConfig.load.structure)
			}

			this.keyStructure = createTranslationKeyStructure<Langs, Trans>(
				config.langs as Langs[], 
				_loadConfig.load.structure as unknown as Trans
			);

			const asyncRequest = async (language: string) => {
				this.lastMissingKey = Date.now()
				const translations = await _loadConfig.load.request(language, new Date(this.lastMissingKey || Date.now()));

				const _translations: TranslationObj<Langs, Trans> = {
					translations,
					lastTranslation: Date.now()
				}

				await Promise.all(
					this.onTranslationSets.map((onTranslationSet) => Promise.resolve(onTranslationSet(language, _translations)))
				)

				const flattenTranslations = flattenObject(translations);

				return createProxy<Trans>(
					flattenTranslations,
					this.structure,
					(_loadConfig.load.isGoingToRequestOnMissingKeys ?? true) 
						? () => {
							if ( !isExpired(this.lastMissingKey, (_loadConfig.load.missingKeysThreshold ?? 3600000)) ) {
								return;
							}
							asyncRequest(language)
							.then((translations) => {
								this.set(
									language, 
									translations as Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans>
								)

								onMissingKeyRequest();
							});
						} : () => {}
				)
			}

			this.langMaps.set('request', asyncRequest);

			config.langs.forEach((lang) => {
				let trans: TranslationObj<Langs, Trans> | undefined;
				this.onTranslationGets.forEach((onTranslationGet) => {
					trans = onTranslationGet(lang as Langs, trans?.translations);
				})

				if ( trans ) {
					const translations = createProxy<Trans>(
						flattenObject(trans.translations as Narrow<Trans>),
						this.structure,
						((this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.isGoingToRequestOnMissingKeys ?? true) 
							? () => {
								if ( !isExpired(this.lastMissingKey, ((this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.missingKeysThreshold ?? 3600000)) ) {
									return;
								}
								asyncRequest(lang as Langs)
								.then((translations) => {
									this.set(
										lang as Langs, 
										translations as Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans>
									)

									onMissingKeyRequest();
								});
							} : () => {}
					)

					this.set(
						lang as Langs,
						translations as Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans>,
						trans.lastTranslation
					)
				}
			})
		}
	}

	public get(language: Langs | string): (
		Trans extends TranslationsType<Langs> 
			? TranslationsKeys<Langs, Trans> 
			: BaseTranslationsKeys<Trans> 
	) | (() => Promise<void>) {
		const trans = this.langMaps.get(language as Langs);
		if ( 
			!trans || 
			(
				(this.config as unknown as SetupTranslationsConfigLoad<Trans>).load && 
				(this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.translationTimeout !== undefined && 
				trans && 
				isExpired(
					trans.lastTranslation, 
					(this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.translationTimeout!
				)
			)
		) {
			return async () => {
				const translations = await this.langMaps.get('request')!(language) as Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans>;
			
				this.set(language, translations);
			}
		}
		if ( typeof trans.translations === 'function' ) {
			return async () => {
				this.set(language, await (trans.translations as unknown as () => Promise<any>)());
			}
		}

		return trans.translations as unknown as (
			Trans extends TranslationsType<Langs> 
				? TranslationsKeys<Langs, Trans> 
				: BaseTranslationsKeys<Trans> 
		) | (() => Promise<void>)
	}

	public set(
		language: Langs | string, 
		translations: Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans>,
		lastTranslation: number = Date.now()
	) {
		const _translations: LangMapTranslationObj<Langs, Trans> = {
			translations,
			lastTranslation
		}

		return this.langMaps.set(
			language as Langs, 
			_translations
		)
	}
}
