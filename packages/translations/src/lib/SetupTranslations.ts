/* eslint-disable n/no-callback-literal */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
	BaseTranslationsKeys,
	BaseTranslationsType,
	TranslationsKeys,
	TranslationsType
} from './types/TranslationTypes'
import type {
	OnTranslationGet,
	OnTranslationSet,
	SetupConfig,
	SetupTranslationsConfig,
	SetupTranslationsConfigLoad,
	SetupTranslationsConfigTranslations,
	TranslationPlugin
} from './types/configTypes'
import type { TFunction } from './types/types'
import { MapTranslations } from './utils/MapTranslations'
import { separatePlugins } from './utils/utils'

export type EventsType<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
> = {
	languageChange: Array<(this: SetupTranslationsInstance<Langs, B, Trans>, language: string) => void>
	missingRequestKeys: Array<(this: SetupTranslationsInstance<Langs, B, Trans>, ) => void>
}

export type EventType = keyof EventsType<string, BaseTranslationsType, undefined>

export class SetupTranslationsInstance<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
> {
	private events: EventsType<Langs, B, Trans> = {
		languageChange: [],
		missingRequestKeys: []
	};

	public isReady: boolean = false;
	public config: SetupConfig<Langs, B, Trans>

	private readonly translationsMap: MapTranslations<Langs, B, Trans extends undefined ? TranslationsType<Langs> : Trans>;
	private readonly onLanguageChanges: Array<NonNullable<TranslationPlugin<Langs, B, Trans>['onLanguageChange']>> = [];
	
	public get language() {
		return this.config.language
	}

	public get languages() {
		return this.config.langs
	}

	public get T(): Trans extends undefined ? BaseTranslationsKeys<B> : TranslationsKeys<Langs, Trans extends undefined ? Record<string, any> : Trans, undefined> {
		return this.translationsMap.get(this.config.language) as Trans extends undefined ? BaseTranslationsKeys<B> : TranslationsKeys<Langs, Trans extends undefined ? Record<string, any> : Trans, undefined>
	}

	public promise: Promise<SetupTranslationsInstance<Langs, B, Trans>> = Promise.resolve(this);

	constructor(config: SetupTranslationsConfig<Langs> & (SetupTranslationsConfigTranslations<Langs, Trans> | SetupTranslationsConfigLoad<B>)) {
		const {
			configs, onLanguageChanges, onTranslationGets, onTranslationSets
		} = separatePlugins(config);

		this.onLanguageChanges = onLanguageChanges;

		let _config: SetupConfig<Langs, B, Trans> = {
			...config,
			defaultLanguage: config.defaultLanguage ?? 'en' as Langs,
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
		this.translationsMap = new MapTranslations<Langs, B, Trans extends undefined ? TranslationsType<Langs> : Trans>(
			_config as any,
			onTranslationGets as Array<OnTranslationGet<Langs, Trans extends undefined ? TranslationsType<Langs> : Trans>>,
			onTranslationSets as unknown as Array<OnTranslationSet<Langs, Trans extends undefined ? TranslationsType<Langs> : Trans>>,
			() => {
				this.emit('missingRequestKeys');
			}
		)
		// #endregion Maps translations to each language

		this.isReady = !promises.length;

		const setTranslationsReady = async () => {
			_config.language = _config.language || _config.defaultLanguage!;
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

	public t = (key: string, values?: Record<string, any>): TFunction<B> => {
		const translations = this.translationsMap.get(this.config.language) as Trans extends undefined ? BaseTranslationsKeys<B> : TranslationsKeys<Langs, Trans extends undefined ? Record<string, any> : Trans, undefined>;
		const keyValue = translations[key];

		if ( values && typeof keyValue === 'function' ) {
			return (keyValue as (params: any) => string)(values) as unknown as TFunction<B>
		}

		return keyValue as unknown as TFunction<B>;
	}

	private emit<K extends Exclude<EventType, 'all'>>(event: K, ...value: Parameters<EventsType<Langs, B, Trans>[K][number]>) {
		this.events[event].forEach((cb) => {
			const _cb = cb.bind(this);
			
			// @ts-expect-error Its tuple, but typescript doesn't see it
			_cb(...value); 
		})
	}

	public addEventListener = <E extends EventType>(type: E, cb: (EventsType<Langs, B, Trans>[E][number])): () => void => {
		this.events[type].push(cb as any);

		return () => {
			const fnEvents: any[] = [...this.events[type]];
			const index = fnEvents.findIndex((event) => event === cb);

			fnEvents.splice(index, 1)

			this.events[type] = fnEvents;
		}
	}

	public changeLanguage = async (lang: Langs | string) => {
		this.config.language = lang;

		this.onLanguageChanges.forEach((onLanguageChange) => {
			onLanguageChange(lang)
		})

		const langTranslations = this.translationsMap.get(this.config.language);

		if ( typeof langTranslations === 'function' ) {
			await langTranslations()
		}

		this.emit('languageChange', this.config.language);
	}
}

export function SetupTranslations<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): Omit<SetupTranslationsInstance<Langs, B, Trans>, 't'>
export function SetupTranslations<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<B>
): SetupTranslationsInstance<Langs, B, Trans>
export function SetupTranslations<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & (SetupTranslationsConfigTranslations<Langs, Trans> | SetupTranslationsConfigLoad<B>)
): SetupTranslationsInstance<Langs, B, Trans> {
	return new SetupTranslationsInstance<Langs, B, Trans>(config);
}
