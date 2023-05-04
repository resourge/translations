import type {
	BaseTranslationsType,
	Narrow,
	TranslationsKeys,
	TranslationsType
} from './TranslationTypes'

export type TranslationObj<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | undefined
> = {
	lastTranslation: number
	translations: TranslationsKeys<Langs, Trans extends undefined ? TranslationsType<Langs> : Trans, undefined>
}

export type OnTranslationGet<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | undefined
> = (
	language: string,
	localTranslations?: TranslationObj<Langs, Trans>
) => undefined | TranslationObj<Langs, Trans>

export type OnTranslationSet<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | undefined
> = (
	language: string, 
	config: TranslationObj<Langs, Trans>
) => void | Promise<void>

export type TranslationPlugin<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined
> = {
	config?: (config: SetupConfig<Langs, B, Trans>) => SetupConfig<Langs, B, Trans>
	onLanguageChange?: (language: string) => void
	onTranslationGet?: OnTranslationGet<Langs, Trans>
	onTranslationSet?: OnTranslationSet<Langs, Trans>
}

export type SetupTranslationsConfigLoad<
	B extends BaseTranslationsType
> = {
	load: {
		request: (language: string, lastRequest: Date) => any
		structure: Narrow<B>
		/**
		 * Request again on missingKey @default true
		 */
		isGoingToRequestOnMissingKeys?: boolean
		/**
		 * Threshold for missingKey request again @default 3600000 (1 hour)
		 */
		missingKeysThreshold?: number
		/**
		 * Defines the logitivity of the translations
		 */
		translationTimeout?: number
	}
	plugins?: Array<TranslationPlugin<string, B, undefined>>
}

export type SetupTranslationsConfigTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | undefined = undefined
> = {
	translations: Narrow<Trans>
	plugins?: Array<TranslationPlugin<Langs, BaseTranslationsType, Trans> | TranslationPlugin<string, BaseTranslationsType, undefined>>
}

export type SetupTranslationsConfig<
	Langs extends string
> = {
	langs: Narrow<Langs[]>
	defaultLanguage?: Langs
}

export type SetupConfig<
	Langs extends string,
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined
> = SetupTranslationsConfig<Langs> & (SetupTranslationsConfigTranslations<Langs, Trans> | SetupTranslationsConfigLoad<B>) & {
	language: string
}
