/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type LiteralUnion } from 'type-fest'

import type {
	BaseTranslationsKeys,
	BaseTranslationsType,
	TranslationsKeys,
	TranslationsType
} from './types/TranslationTypes'
import type {
	SetupConfig,
	SetupTranslationsConfig,
	SetupTranslationsConfigLoad,
	SetupTranslationsConfigTranslations,
	TranslationPlugin
} from './types/configTypes'
import { type ConvertTransIntoKeyStructure } from './types/types'
import { MapTranslations, type TFunction } from './utils/MapTranslations'
import { separatePlugins } from './utils/utils'

export type EventsType<
	Instance
> = {
	languageChange: Array<(this: Instance, language: string) => void>
	missingRequestKeys: Array<(this: Instance) => void>
}

export type EventType = keyof EventsType<any>

export class SetupTranslationsInstance<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> {
	private events: EventsType<this> = {
		languageChange: [],
		missingRequestKeys: []
	};

	public isReady: boolean = false;
	public config: SetupConfig<Langs, Trans>

	private readonly translationsMap: MapTranslations<Langs, Trans>;
	private readonly onLanguageChanges: Array<NonNullable<TranslationPlugin['onLanguageChange']>> = [];
	
	public get language() {
		return this.config.language
	}

	public get languages() {
		return this.config.langs
	}

	/**
	 * Translations object
	 */
	public get T(): Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans> {
		return this.translationsMap.get(this.config.language) as any
	}

	/**
	 * Translations Key in form of object
	 */
	public get K(): ConvertTransIntoKeyStructure<Langs, Trans> {
		return this.translationsMap.keyStructure
	}

	public promise: Promise<SetupTranslationsInstance<Langs, Trans>> = Promise.resolve(this);

	constructor(
		config: SetupTranslationsConfig<Langs> & (
			Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
		)
	) {
		const {
			configs, onLanguageChanges, onTranslationGets, onTranslationSets
		} = separatePlugins<Langs, Trans>(config);

		this.onLanguageChanges = onLanguageChanges;

		let _config: SetupConfig<Langs, Trans> = {
			...config as any,
			defaultLanguage: config.defaultLanguage ?? config.langs[0] ?? 'en' as Langs,
			language: ''
		};

		const promises: Array<Promise<void>> = []

		// #region Execute plugins config
		configs.forEach((config) => {
			const c = config(_config);
			if ( c instanceof Promise ) {
				promises.push(
					c.then((_c) => {
						_config = _c
					})
				)
			}
			else {
				_config = c
			}
		})
		// #endregion Execute plugins config

		// #region Maps translations to each language
		this.translationsMap = new MapTranslations<Langs, Trans>(
			_config,
			onTranslationGets,
			onTranslationSets,
			() => {
				this.emit('missingRequestKeys');
			}
		)
		// #endregion Maps translations to each language

		this.isReady = !promises.length;

		const setTranslationsReady = async () => {
			_config.language = _config.language || _config.defaultLanguage;

			_config.language = !_config.langs.length || (_config.langs ).includes(_config.language as Langs) ? _config.language : _config.defaultLanguage; 
			
			this.isReady = false;

			const langTranslations = this.translationsMap.get(_config.language)

			if ( langTranslations && typeof langTranslations === 'function' ) {
				await langTranslations();
			}

			this.isReady = true;

			return this;
		}

		this.promise = !this.isReady 
			? Promise.all(promises)
			.then(() => setTranslationsReady())
			: Promise.resolve(setTranslationsReady())

		this.config = _config;
	}

	public get t(): TFunction<Langs, Trans> {
		return this.translationsMap.t;
	}

	private emit<K extends Exclude<EventType, 'all'>>(event: K, ...value: Parameters<EventsType<this>[K][number]>) {
		this.events[event].forEach((cb) => {
			const _cb = cb.bind(this);
			
			// @ts-expect-error Its tuple, but typescript doesn't see it
			_cb(...value); 
		})
	}

	public addEventListener = <E extends EventType>(type: E, cb: (EventsType<this>[E][number])): () => void => {
		this.events[type].push(cb as any);

		return () => {
			const fnEvents: any[] = [...this.events[type]];
			const index = fnEvents.findIndex((event) => event === cb);

			fnEvents.splice(index, 1)

			this.events[type] = fnEvents;
		}
	}

	public changeLanguage = async (lang: LiteralUnion<Langs, string>) => {
		if ( this.config.langs.length && !this.config.langs.includes(lang as any) ) {
			return await Promise.reject(`Language ${lang}, is not included in the list of languages: ${this.config.langs.join(', ')}`)
		}
		this.config.language = lang;

		const langTranslations = this.translationsMap.get(this.config.language);

		if ( typeof langTranslations === 'function' ) {
			await langTranslations()
		}

		this.onLanguageChanges.forEach((onLanguageChange) => {
			onLanguageChange(lang)
		})

		this.emit('languageChange', this.config.language);
	}
}

export function SetupTranslations<
	Langs extends string, 
	const Trans extends TranslationsType<Langs>
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): SetupTranslationsInstance<Langs, Trans> 
export function SetupTranslations<
	Langs extends string, 
	const Trans extends BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<Trans>
): SetupTranslationsInstance<Langs, Trans>
export function SetupTranslations<
	Langs extends string, 
	const Trans extends TranslationsType<Langs> | BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & (
		Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
	)
): SetupTranslationsInstance<Langs, Trans> {
	return new SetupTranslationsInstance<Langs, Trans>(config as any);
}
