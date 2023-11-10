/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type {
	BaseTranslationsKeys,
	BaseTranslationsType,
	AsConst,
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
import { type ConvertTransIntoKeyStructure } from '../types/types'

import { createProxy } from './createProxy';
import { createTranslationEntry } from './createTranslationEntry';
import { createTranslationKeyStructure } from './createTranslationKeyStructure';
import { deepValue, isExpired } from './utils';

function flattenObject<B extends BaseTranslationsType>(structure: AsConst<B>, prefix: string = ''): Record<string, string> {
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

export type LangMapTranslationObj = {
	lastTranslation: number
	translations: Record<string, any>
}

export type LangMaps< 
	Langs extends string,
	Trans extends Record<string, any>
> = Map<
	Langs, 
	LangMapTranslationObj
> & Map<
	'request', 
	((language: string, date?: Date) => Promise<BaseTranslationsKeys<Trans>>)
>

const translationMethod = {
	__translationsMethod__: <T extends Record<string, any>>(
		langKey: string, 
		translations: T | ((lang: string) => Promise<T>)
	) => createTranslationEntry(langKey, translations as any),
	__translationsKeyStructure__: <
		Langs extends string, 
		T extends Record<string, any>
	>(
		langs: Langs[],
		translations: T
	) => createTranslationKeyStructure(langs, translations)
}

function createLanguages<
	Langs extends string, 
	T extends Record<string, any>
>(
	langs: Langs[],
	translations: AsConst<T> | ((lang: string) => Promise<AsConst<T>>)
) {
	return langs
	.reduce<
		LangMaps<Langs, T>
	>(
		(obj: LangMaps<Langs, T>, langKey: string) => {
			obj.set(
				langKey as Langs, 
				{
					translations: translationMethod.__translationsMethod__(langKey, translations as any) as any,
					lastTranslation: Date.now()
				}
			);

			return obj
		}, 
		new Map()
	);
}

export class MapTranslations<
	Langs extends string, 
	Trans extends Record<string, any>
> {
	public langMaps: LangMaps<Langs, Trans> = new Map();
	public isLoad: boolean = false;

	public structure: Trans & Record<string, string> = {} as Trans & Record<string, string>;
	public keyStructure: ConvertTransIntoKeyStructure<Langs, Trans> = {} as ConvertTransIntoKeyStructure<Langs, Trans>;

	public t!: (key: string, values?: Record<string, any>) => string

	constructor(
		public config: SetupConfig<Langs, Trans>,
		public onTranslationGets: Array<OnTranslationGet<Langs, Trans>>,
		public onTranslationSets: Array<OnTranslationSet<Langs, Trans>>,
		onMissingKeyRequest: () => void
	) {
		const _translationConfig = (config as unknown as SetupTranslationsConfigTranslations<Langs, Record<string, any>>);
		const _loadConfig = (config as unknown as SetupTranslationsConfigLoad<Trans extends BaseTranslationsType ? Trans : BaseTranslationsType>);
		if ( _translationConfig.translations ) {
			this.keyStructure = (config as { keyStructure?: ConvertTransIntoKeyStructure<Langs, Trans> }).keyStructure as unknown as ConvertTransIntoKeyStructure<Langs, Trans> || translationMethod.__translationsKeyStructure__<Langs, Trans>(config.langs as Langs[], _translationConfig.translations as any)
			this.langMaps = createLanguages<Langs, Record<string, any>>(
				config.langs as Langs[], 
				_translationConfig.translations
			) as unknown as any;

			this.t = (
				key: string,
				values?: Record<string, any>
			) => {
				try {
					const translations = this.get(this.config.language) as any;

					const keyValue = key.includes('.') 
						? deepValue(translations, key) 
						: translations[key];

					const value = values && typeof keyValue === 'function' 
						? ((keyValue as (params: any) => string)(values) as any)
						: (keyValue )

					return value || key
				}
				catch {
					return key
				}
			};
		}
		else if ( _loadConfig.load ) {
			this.isLoad = true;

			this.t = (
				key: string,
				values?: Record<string, any>
			) => {
				const translations = this.get(this.config.language) as Record<string, any>;

				const keyValue = translations[key];

				const value = values && typeof keyValue === 'function' 
					? ((keyValue as (params: any) => string)(values) as any)
					: keyValue

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

			const createTranslationsProxy = (
				flattenTranslations: Record<string, string>,
				language: string,
				lastTranslation: number
			) => {
				return createProxy<Trans>(
					flattenTranslations,
					this.structure,
					(_loadConfig.load.isGoingToRequestOnMissingKeys ?? true) 
						? () => {
							if ( !isExpired(lastTranslation, ((this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.missingKeysThreshold ?? 3600000)) ) {
								return;
							}
							asyncRequest(language, new Date(lastTranslation))
							.then((translations) => {
								this.set(
									language, 
									translations as any
								)

								onMissingKeyRequest();
							});
						} : () => {}
				)
			}

			const asyncRequest = async (language: string, date: Date = new Date()) => {
				const translations = await _loadConfig.load.request(language, date);

				const _translations: TranslationObj<Langs, Trans> = {
					translations,
					lastTranslation: Date.now()
				}

				await Promise.all(
					this.onTranslationSets.map((onTranslationSet) => Promise.resolve(onTranslationSet(language, _translations)))
				)

				const flattenTranslations = flattenObject(translations);

				return createTranslationsProxy(
					flattenTranslations,
					language,
					_translations.lastTranslation
				)
			}

			this.langMaps.set('request', asyncRequest);

			config.langs.forEach((lang) => {
				let trans: TranslationObj<Langs, Trans> | undefined;
				this.onTranslationGets.forEach((onTranslationGet) => {
					trans = onTranslationGet(lang as Langs, trans?.translations);
				})

				if ( trans ) {
					const translations = createTranslationsProxy(
						flattenObject(trans.translations as AsConst<Trans>),
						lang as Langs,
						trans.lastTranslation
					);

					this.set(
						lang as Langs,
						translations as any,
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
				const translations = await this.langMaps.get('request')!(language, trans ? new Date(trans.lastTranslation) : undefined) as any;
			
				this.set(language, translations);
			}
		}
		if ( typeof trans.translations === 'function' ) {
			return async () => {
				this.set(language, await (trans.translations as unknown as () => Promise<any>)());
			}
		}

		return trans.translations as unknown as any
	}

	private set(
		language: Langs | string, 
		translations: Record<string, any>,
		lastTranslation: number = Date.now()
	) {
		return this.langMaps.set(
			language as Langs, 
			{
				translations,
				lastTranslation
			}
		)
	}
}
