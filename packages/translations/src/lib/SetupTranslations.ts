import { type LiteralUnion } from 'type-fest';

import type {
	SetupConfig,
	SetupTranslationsConfig,
	SetupTranslationsConfigLoad,
	SetupTranslationsConfigTranslations,
	TranslationPlugin
} from './types/configTypes';
import type {
	BaseTranslationsKeys,
	BaseTranslationsType,
	TranslationsKeys,
	TranslationsType
} from './types/TranslationTypes';
import { type ConvertTransIntoKeyStructure } from './types/types';
import { MapTranslations, type TFunction } from './utils/MapTranslations';
import { separatePlugins } from './utils/utils';

export type EventsType<
	Instance
> = {
	languageChange: Array<(this: Instance, language: string) => void>
	missingRequestKeys: Array<(this: Instance) => void>
};

export type EventType = keyof EventsType<any>;

export function SetupTranslations<
	Langs extends string, 
	const Trans extends TranslationsType<Langs>
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): SetupTranslationsInstance<Langs, Trans>;
export function SetupTranslations<
	Langs extends string, 
	const Trans extends BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<Trans>
): SetupTranslationsInstance<Langs, Trans>; 
export function SetupTranslations<
	Langs extends string, 
	const Trans extends BaseTranslationsType | TranslationsType<Langs>
>(
	config: SetupTranslationsConfig<Langs> & (
		Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
	)
): SetupTranslationsInstance<Langs, Trans> {
	return new SetupTranslationsInstance<Langs, Trans>(config as any);
}

export class SetupTranslationsInstance<
	Langs extends string, 
	Trans extends BaseTranslationsType | TranslationsType<Langs>
> {
	public config: SetupConfig<Langs, Trans>;

	public isReady: boolean = false;
	public promise: Promise<SetupTranslationsInstance<Langs, Trans>> = Promise.resolve(this);

	/**
	 * Translations Key in form of object
	 */
	public get K(): ConvertTransIntoKeyStructure<Langs, Trans> {
		return this.translationsMap.keyStructure;
	}

	public get language() {
		return this.config.language;
	}

	public get languages() {
		return this.config.langs;
	}
	
	/**
	 * Translations object
	 */
	public get T(): Trans extends TranslationsType<Langs> ? TranslationsKeys<Langs, Trans> : BaseTranslationsKeys<Trans> {
		return this.translationsMap.get(this.config.language) as any;
	}

	public get t(): TFunction<Langs, Trans> {
		return this.translationsMap.t;
	}

	private events: EventsType<this> = {
		languageChange: [],
		missingRequestKeys: []
	};

	private readonly onDestroys: Array<() => void> = [];

	private readonly onLanguageChanges: Array<NonNullable<TranslationPlugin['onLanguageChange']>> = [];

	private readonly translationsMap: MapTranslations<Langs, Trans>;

	constructor(
		config: SetupTranslationsConfig<Langs> & (
			Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
		)
	) {
		const {
			configs, onDestroys, onLanguageChanges, onTranslationGets, onTranslationSets
		} = separatePlugins<Langs, Trans>(config);

		this.onLanguageChanges = onLanguageChanges;
		this.onDestroys = onDestroys;

		let _config: SetupConfig<Langs, Trans> = {
			...config as any,
			defaultLanguage: config.defaultLanguage ?? config.langs[0] ?? 'en' as Langs,
			language: ''
		};

		const promises: Array<Promise<void>> = [];

		// #region Execute plugins config
		configs.forEach((config) => {
			const c = config(_config, (language) => this.baseChangeLanguage(language));
			if ( c instanceof Promise ) {
				promises.push(
					c.then((_c) => {
						_config = _c;
					})
				);
			}
			else {
				_config = c;
			}
		});
		// #endregion Execute plugins config

		// #region Maps translations to each language
		this.translationsMap = new MapTranslations<Langs, Trans>(
			_config,
			onTranslationGets,
			onTranslationSets,
			() => {
				this.emit('missingRequestKeys');
			}
		);
		// #endregion Maps translations to each language

		this.isReady = promises.length === 0;

		const setTranslationsReady = async () => {
			_config.language = _config.language || _config.defaultLanguage;

			_config.language = _config.langs.length === 0 || (_config.langs ).includes(_config.language as Langs)
				? _config.language
				: _config.defaultLanguage; 
			
			this.isReady = false;

			const langTranslations = this.translationsMap.get(_config.language);

			if ( langTranslations && typeof langTranslations === 'function' ) {
				await langTranslations();
			}

			this.isReady = true;

			return this;
		};

		this.promise = this.isReady 
			? Promise.resolve(setTranslationsReady())
			: Promise.all(promises)
			.then(() => setTranslationsReady());

		this.config = _config;
	}

	public addEventListener = <E extends EventType>(type: E, cb: (EventsType<this>[E][number])): () => void => {
		this.events[type].push(cb as any);

		return () => {
			const fnEvents: any[] = [...this.events[type]];
			const index = fnEvents.indexOf(cb);

			fnEvents.splice(index, 1);

			this.events[type] = fnEvents;
		};
	};

	public baseChangeLanguage = async (lang: LiteralUnion<Langs, string>) => {
		if ( this.config.langs.length > 0 && !this.config.langs.includes(lang as any) ) {
			// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
			return await Promise.reject(`Language ${lang}, is not included in the list of languages: ${this.config.langs.join(', ')}`);
		}

		const langTranslations = this.translationsMap.get(lang);

		if ( typeof langTranslations === 'function' ) {
			await langTranslations();
		}
		
		this.config.language = lang;

		this.emit('languageChange', this.config.language);
	};

	public changeLanguage = async (lang: LiteralUnion<Langs, string>) => {
		await this.baseChangeLanguage(lang);

		this.onLanguageChanges.forEach((onLanguageChange) => {
			onLanguageChange(lang);
		});
	};

	public onDestroy() {
		this.onDestroys
		.forEach((onDestroy) => {
			onDestroy();
		});
	}

	private emit<K extends Exclude<EventType, 'all'>>(event: K, ...value: Parameters<EventsType<this>[K][number]>) {
		this.events[event].forEach((cb) => {
			const _cb = cb.bind(this);
			
			// @ts-expect-error Its tuple, but typescript doesn't see it
			_cb(...value); 
		});
	}
}
