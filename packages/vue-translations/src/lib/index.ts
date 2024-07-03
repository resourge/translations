import {
	gender,
	languageLocalStorage,
	navigatorLanguageDetector,
	type BaseTranslationsType,
	htmlLanguage,
	plural,
	CustomMethods
} from '@resourge/translations'

import { type SetupVueTranslationReturn, SetupVueTranslations } from './SetupVueTranslations'

export * from './components'

export { 
	gender,
	navigatorLanguageDetector,
	htmlLanguage,
	languageLocalStorage,
	plural,
	SetupVueTranslations,
	CustomMethods,

	type BaseTranslationsType,

	type SetupVueTranslationReturn
}
