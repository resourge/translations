/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type {
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

import { createProxy } from './createProxy';
import { createFromEntry, isExpired } from './utils';

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

export type LangMaps<
	Langs extends string, 
	T extends TranslationsType<Langs>
> = Map<
	Langs, 
	TranslationObj<Langs, T>
> & Map<
	'request', 
	((language: string) => Promise<TranslationsKeys<Langs, T>>)
>

const translationMethod = {
	__translationsMethod__: <Langs extends string, T extends TranslationsType<Langs>>(
		langKey: string, 
		translations: Narrow<T> | ((lang: string) => Promise<Narrow<T>>)
	) => createFromEntry(langKey, translations as Narrow<T>)
}

function createLanguages<
	Langs extends string, 
	T extends TranslationsType<Langs>
>(
	langs: Langs[],
	translations: Narrow<T> | ((lang: string) => Promise<Narrow<T>>)
): LangMaps<Langs, T> {
	return langs
	.reduce<
		LangMaps<Langs, T>
	>(
		(obj: LangMaps<Langs, T>, langKey: string) => {
			obj.set(
				langKey as Langs, 
				{
					translations: translationMethod.__translationsMethod__(langKey, translations) as any,
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
	B extends BaseTranslationsType,
	T extends TranslationsType<Langs>
> {
	public langMaps: LangMaps<Langs, T> = new Map();
	public isLoad: boolean = false;

	public structure: B & Record<string, string> = {} as B & Record<string, string>;

	public lastMissingKey: number = 0;

	constructor(
		public config: SetupConfig<Langs, B, T>,
		public onTranslationGets: Array<OnTranslationGet<Langs, T>>,
		public onTranslationSets: Array<OnTranslationSet<Langs, T>>,
		onMissingKeyRequest: () => void
	) {
		if ( (config as SetupTranslationsConfigTranslations<Langs, T>).translations ) {
			this.langMaps = createLanguages<Langs, T>(
				config.langs as Langs[], 
				(config as SetupTranslationsConfigTranslations<Langs, T>).translations
			);
		}
		else if ( (config as SetupTranslationsConfigLoad<B>).load ) {
			this.isLoad = true;

			this.structure = {
				...((config as SetupTranslationsConfigLoad<B>).load.structure as B),
				...flattenObject((config as SetupTranslationsConfigLoad<B>).load.structure)
			}

			const asyncRequest = async (language: string) => {
				const configLoad = (config as SetupTranslationsConfigLoad<B>);
				this.lastMissingKey = Date.now()
				const translations = await configLoad.load.request(language, new Date(this.lastMissingKey || Date.now()));

				const _translations: TranslationObj<Langs, T> = {
					translations,
					lastTranslation: Date.now()
				}

				await Promise.all(
					this.onTranslationSets.map((onTranslationSet) => Promise.resolve(onTranslationSet(language, _translations)))
				)

				const flattenTranslations = flattenObject(translations);

				return createProxy<Langs, T>(
					flattenTranslations,
					this.structure,
					(configLoad.load.isGoingToRequestOnMissingKeys ?? true) 
						? () => {
							if ( !isExpired(this.lastMissingKey, (configLoad.load.missingKeysThreshold ?? 3600000)) ) {
								return;
							}
							asyncRequest(language)
							.then((translations) => {
								this.set(
									language, 
									translations
								)

								onMissingKeyRequest();
							});
						} : () => {}
				)
			}

			this.langMaps.set('request', asyncRequest);

			config.langs.forEach((lang) => {
				let trans: TranslationObj<Langs, T> | undefined;
				this.onTranslationGets.forEach((onTranslationGet) => {
					trans = onTranslationGet(lang as Langs, trans);
				})

				if ( trans ) {
					const translations = createProxy<Langs, T>(
						flattenObject(trans.translations as Narrow<B>),
						this.structure,
						((this.config as SetupTranslationsConfigLoad<B>).load.isGoingToRequestOnMissingKeys ?? true) 
							? () => {
								if ( !isExpired(this.lastMissingKey, ((this.config as SetupTranslationsConfigLoad<B>).load.missingKeysThreshold ?? 3600000)) ) {
									return;
								}
								asyncRequest(lang as Langs)
								.then((translations) => {
									this.set(
										lang as Langs, 
										translations
									)

									onMissingKeyRequest();
								});
							} : () => {}
					)

					this.langMaps.set(
						lang as Langs, 
						{
							translations: translations as unknown as TranslationsKeys<Langs, T extends undefined ? TranslationsType<Langs> : T, undefined>,
							lastTranslation: trans.lastTranslation
						}
					)
				}
			})
		}
	}

	public get(language: Langs | string): TranslationsKeys<Langs, T> | (() => Promise<void>) {
		const trans = this.langMaps.get(language as Langs);
		if ( 
			!trans || 
			(
				(this.config as SetupTranslationsConfigLoad<B>).load && 
				(this.config as SetupTranslationsConfigLoad<B>).load.translationTimeout !== undefined && 
				trans && 
				isExpired(
					trans.lastTranslation, 
					(this.config as SetupTranslationsConfigLoad<B>).load.translationTimeout!
				)
			)
		) {
			return async () => {
				const translations = await this.langMaps.get('request')!(language);
			
				this.set(language, translations);
			}
		}
		if ( typeof trans.translations === 'function' ) {
			return async () => {
				this.set(language, await (trans.translations as unknown as () => Promise<any>)());
			}
		}

		return trans.translations as unknown as TranslationsKeys<Langs, T>
	}

	public set(
		language: Langs | string, 
		translations: TranslationsKeys<
			Langs, 
			T
		>
	) {
		const _translations: TranslationObj<Langs, T> = {
			translations: translations as any,
			lastTranslation: Date.now()
		}

		return this.langMaps.set(
			language as Langs, 
			_translations
		)
	}
}
