import {
	gender,
	languageLocalStorage,
	navigatorLanguageDetector,
	plural,
	type BaseTranslationsType
} from '@resourge/translations'

import { type SetupReactTranslationsReturn, SetupReactTranslations } from './SetupReactTranslation'

export * from './components'
export * from './contexts'
export * from './types'

export { 
	gender,
	languageLocalStorage,
	navigatorLanguageDetector,
	plural,
	type BaseTranslationsType,

	type SetupReactTranslationsReturn as SetupReactTranslationReturn, 
	SetupReactTranslations
}
