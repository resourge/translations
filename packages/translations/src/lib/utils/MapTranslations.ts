import { type LiteralUnion, type Paths } from 'type-fest';

import type {
	OnTranslationGet,
	OnTranslationSet,
	SetupConfig,
	SetupTranslationsConfigLoad,
	SetupTranslationsConfigTranslations,
	TranslationObj
} from '../types/configTypes';
import type {
	BaseTranslationsKeys,
	BaseTranslationsType,
	TranslationsKeys,
	TranslationsType
} from '../types/TranslationTypes';
import { type ConvertTransIntoKeyStructure } from '../types/types';

import { createProxy } from './createProxy';
import { createTranslationEntry } from './createTranslationEntry';
import { createTranslationKeyStructure } from './createTranslationKeyStructure';
import { deepValue, isExpired } from './utils';

export type LangMaps<Langs extends string,
	Trans extends Record<string, any>
> = Map<
	'request', 
	((language: string, date?: Date) => Promise<BaseTranslationsKeys<Trans>>)
> & Map<
	Langs, 
	LangMapTranslationObj
>;

export type LangMapTranslationObj = {
	lastTranslation: number
	translations: Record<string, any>
};

function flattenObject<const B extends BaseTranslationsType>(structure: B, prefix: string = ''): Record<string, string> {
	return Object.keys(structure)
	.reduce<Record<string, string>>((acc, k) => {
		const pre = prefix.length > 0
			? prefix + '.'
			: '';
		const value = (structure as BaseTranslationsType)[k] as BaseTranslationsType;
		if (typeof value === 'object') {
			return {
				...acc,
				...flattenObject(value, pre + k)
			};
		}
		else {
			acc[pre + k] = value;
		};
		return acc;
	}, {});
}

const translationMethod = {
	__translationsKeyStructure__: <
		Langs extends string, 
		T extends Record<string, any>
	>(
		langs: Langs[],
		translations: T
	) => createTranslationKeyStructure(langs, translations),
	__translationsMethod__: <T extends Record<string, any>>(
		langKey: string, 
		translations: ((lang: string) => Promise<T>) | T
	) => createTranslationEntry(langKey, translations as any)
};

type OmitArray<T, K extends number | string | symbol> = Array<OmitDeep<T, K>>;

type OmitDeep<T, K extends number | string | symbol> = T extends object
	? {
		[P in keyof T as P extends K ? never : P]: T[P] extends Array<infer U>
			? OmitArray<U, K>
			: OmitDeep<T[P], K>;
	}
	: T;

type TransKeys<Langs extends string, Trans extends Record<string, any>> = LiteralUnion<
	Paths<
		OmitDeep<
			Trans, 
			Langs
		>
	>, 
	string
>;

export type TFunction<
	Langs extends string, 
	Trans extends Record<string, any>
> = (key: TransKeys<Langs, Trans>, values?: Record<string, any>) => string;

function createLanguages<
	Langs extends string, 
	const T extends Record<string, any>
>(
	langs: Langs[],
	translations: ((lang: string) => Promise<T>) | T
) {
	return langs
	.reduce<
		LangMaps<Langs, T>
	>(
		(obj: LangMaps<Langs, T>, langKey: string) => {
			obj.set(
				langKey as Langs, 
				{
					lastTranslation: Date.now(),
					translations: translationMethod.__translationsMethod__(langKey, translations as any)
				}
			);

			return obj;
		}, 
		new Map()
	);
}

export class MapTranslations<
	Langs extends string, 
	Trans extends Record<string, any>
> {
	public isLoad: boolean = false;
	public keyStructure: ConvertTransIntoKeyStructure<Langs, Trans> = {} as ConvertTransIntoKeyStructure<Langs, Trans>;

	public langMaps: LangMaps<Langs, Trans> = new Map();
	public structure: Record<string, string> & Trans = {} as Record<string, string> & Trans;

	public t!: TFunction<Langs, Trans>;

	constructor(
		public config: SetupConfig<Langs, Trans>,
		public onTranslationGets: Array<OnTranslationGet<Langs, Trans>>,
		public onTranslationSets: Array<OnTranslationSet<Langs, Trans>>,
		onMissingKeyRequest: () => void
	) {
		const _translationConfig = config as unknown as SetupTranslationsConfigTranslations<Langs, Record<string, any>>;
		const _loadConfig = config as unknown as SetupTranslationsConfigLoad<Trans extends BaseTranslationsType ? Trans : BaseTranslationsType>;
		if ( _translationConfig.translations ) {
			this.keyStructure = (config as { keyStructure?: ConvertTransIntoKeyStructure<Langs, Trans> }).keyStructure as unknown as ConvertTransIntoKeyStructure<Langs, Trans> || translationMethod.__translationsKeyStructure__<Langs, Trans>(config.langs, _translationConfig.translations as any);
			this.langMaps = createLanguages<Langs, Record<string, any>>(
				config.langs, 
				_translationConfig.translations
			) as unknown as any;

			this.t = (
				key: TransKeys<Langs, Trans>,
				values?: Record<string, any>
			) => {
				try {
					const translations = this.get(this.config.language) as any;

					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					const keyValue = (key as string).includes('.') 
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
						? deepValue(translations, (key as string)) 
						: translations[key];

					const value = values && typeof keyValue === 'function' 
						? ((keyValue as (params: any) => string)(values) as any)
						: (keyValue );

					// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
					return value || key;
				}
				catch {
					return key;
				}
			};
		}
		else if ( _loadConfig.load ) {
			this.isLoad = true;

			this.t = (
				key: TransKeys<Langs, Trans>,
				values?: Record<string, any>
			) => {
				const translations = this.get(this.config.language) as Record<string, any>;

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				const keyValue = translations[key as string];

				const value = values && typeof keyValue === 'function' 
					? ((keyValue as (params: any) => string)(values) as any)
					: keyValue;

				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				return value || key;
			};

			this.structure = {
				...(_loadConfig.load.structure as Trans),
				...flattenObject(_loadConfig.load.structure)
			};

			this.keyStructure = createTranslationKeyStructure<Langs, Trans>(
				config.langs, 
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
							if ( !isExpired(lastTranslation, ((this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.missingKeysThreshold ?? 3_600_000)) ) {
								return;
							}
							asyncRequest(language, new Date(lastTranslation))
							.then((translations) => {
								this.set(
									language, 
									translations
								);

								onMissingKeyRequest();
							});
						}
						: () => {}
				);
			};

			const asyncRequest = async (language: string, date: Date = new Date()) => {
				const translations = await _loadConfig.load.request(language, date);

				const _translations: TranslationObj<Langs, Trans> = {
					lastTranslation: Date.now(),
					translations
				};

				if ( this.onTranslationSets.length > 0 ) {
					await Promise.all(
						this.onTranslationSets
						.map((onTranslationSet) => Promise.resolve(
							onTranslationSet(language, _translations)
						))
					);
				}

				return createTranslationsProxy(
					flattenObject(translations),
					language,
					_translations.lastTranslation
				);
			};

			this.langMaps.set('request', asyncRequest);

			config.langs.forEach((lang) => {
				let trans: TranslationObj<Langs, Trans> | undefined;

				this.onTranslationGets
				.forEach((onTranslationGet) => {
					trans = onTranslationGet(lang, trans?.translations);
				});

				if ( trans ) {
					const translations = createTranslationsProxy(
						flattenObject(trans.translations),
						lang,
						trans.lastTranslation
					);

					this.set(
						lang,
						translations,
						trans.lastTranslation
					);
				}
			});
		}
	}

	public get(language: Langs | string): (() => Promise<void>) | (
		Trans extends TranslationsType<Langs> 
			? TranslationsKeys<Langs, Trans> 
			: BaseTranslationsKeys<Trans> 
	) {
		const trans = this.langMaps.get(language as Langs);
		if ( 
			!trans 
			|| (
				(this.config as unknown as SetupTranslationsConfigLoad<Trans>).load 
				&& (this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.translationTimeout !== undefined 
				&& trans 
				&& isExpired(
					trans.lastTranslation, 
					(this.config as unknown as SetupTranslationsConfigLoad<Trans>).load.translationTimeout!
				)
			)
		) {
			return async () => {
				const translations = await this.langMaps.get('request')!(language, trans
					? new Date(trans.lastTranslation)
					: undefined) as any;
			
				this.set(language, translations);
			};
		}
		if ( typeof trans.translations === 'function' ) {
			return async () => {
				this.set(language, await (trans.translations as unknown as () => Promise<any>)());
			};
		}

		return trans.translations as unknown as any;
	}

	private set(
		language: Langs | string, 
		translations: Record<string, any>,
		lastTranslation: number = Date.now()
	) {
		return this.langMaps.set(
			language as Langs, 
			{
				lastTranslation,
				translations
			}
		);
	}
}
