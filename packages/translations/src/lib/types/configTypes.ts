import type { BaseTranslationsType, TranslationsType } from './TranslationTypes';

// TranslationsKeys<Langs, Trans extends undefined ? TranslationsType<Langs> : Trans, undefined>

export type OnTranslationConfig<
	Langs extends string, 
	Trans extends BaseTranslationsType | TranslationsType<Langs>
> = (config: SetupConfig<Langs, Trans>, changeLanguage: (language: string) => Promise<any>) => SetupConfig<Langs, Trans>;

export type OnTranslationGet<
	Langs extends string, 
	Trans extends BaseTranslationsType | TranslationsType<Langs>
> = (
	language: string,
	localTranslations?: Trans
) => TranslationObj<Langs, Trans> | undefined;

export type OnTranslationSet<
	Langs extends string, 
	Trans extends BaseTranslationsType | TranslationsType<Langs>
> = (
	language: string, 
	config: TranslationObj<Langs, Trans>
) => Promise<void> | void;

export type SetupConfig<
	Langs extends string,
	Trans extends BaseTranslationsType | TranslationsType<Langs>
> = Omit<SetupTranslationsConfig<Langs>, 'defaultLanguage'> & (
	Trans extends TranslationsType<Langs> 
		? SetupTranslationsConfigTranslations<Langs, Trans> 
		: SetupTranslationsConfigLoad<Trans>
) & {
	defaultLanguage: Langs
	language: string
};

export type SetupTranslationsConfig<
	Langs extends string
> = {
	defaultLanguage?: Langs
	/**
	 * Array of permitted languages. In case of empty array, all languages will be permitted
	 */
	langs: Langs[]
	plugins?: TranslationPlugin[]
};

export type SetupTranslationsConfigLoad<
	B extends BaseTranslationsType
> = {
	load: {
		/**
		 * Request again on missingKey @default true
		 */
		isGoingToRequestOnMissingKeys?: boolean
		/**
		 * Threshold for missingKey request again @default 3600000 (1 hour)
		 */
		missingKeysThreshold?: number
		request: (language: string, lastRequest: Date) => any
		structure: B
		/**
		 * Defines the logitivity of the translations
		 */
		translationTimeout?: number
	}
};

export type SetupTranslationsConfigTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs>
> = {
	translations: Trans
};

export type TranslationObj<
	Langs extends string, 
	Trans extends BaseTranslationsType | TranslationsType<Langs>
> = {
	lastTranslation: number
	translations: Trans
};

export type TranslationPlugin = {
	config?: OnTranslationConfig<string, BaseTranslationsType | TranslationsType<string>>
	onDestroy?: () => void
	onLanguageChange?: (language: string) => void
	onTranslationGet?: OnTranslationGet<string, BaseTranslationsType | TranslationsType<string>>
	onTranslationSet?: OnTranslationSet<string, BaseTranslationsType | TranslationsType<string>>
};
