import type { BaseTranslationsType, Narrow, TranslationsType } from './TranslationTypes'

// TranslationsKeys<Langs, Trans extends undefined ? TranslationsType<Langs> : Trans, undefined>

export type TranslationObj<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = {
	lastTranslation: number
	translations: Trans
}

export type OnTranslationConfig<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = (config: SetupConfig<Langs, Trans>) => SetupConfig<Langs, Trans>

export type OnTranslationGet<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = (
	language: string,
	localTranslations?: Trans
) => undefined | TranslationObj<Langs, Trans>

export type OnTranslationSet<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = (
	language: string, 
	config: TranslationObj<Langs, Trans>
) => void | Promise<void>

export type TranslationPlugin<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = {
	config?: OnTranslationConfig<Langs, Trans>
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
	plugins?: Array<TranslationPlugin<string, B>>
}

export type SetupTranslationsConfigTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs>
> = {
	translations: Narrow<Trans>
	plugins?: Array<TranslationPlugin<Langs, Trans>>
}

export type SetupTranslationsConfig<
	Langs extends string
> = {
	langs: Narrow<Langs[]>
	defaultLanguage?: Langs
}

export type SetupConfig<
	Langs extends string,
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = SetupTranslationsConfig<Langs> & (
	Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
) & {
	language: string
}
