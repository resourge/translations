import type { TranslationsType, BaseTranslationsType } from '../types/TranslationTypes';
import type { TranslationObj, TranslationPlugin } from '../types/configTypes';

export const languageLocalStorage = (): TranslationPlugin => {
	const languageKey = 'lng'

	return globalThis.window ? {
		config(config) {
			config.language = window.localStorage.getItem(languageKey) ?? config.language;

			return config;
		},
		onTranslationSet(language: string, translations: TranslationObj<string, TranslationsType<string> | BaseTranslationsType>) {
			window.localStorage.setItem(`${languageKey}_${language}`, JSON.stringify(translations));
		},
		onTranslationGet(
			language: string,  
			localTranslations?: TranslationsType<string> | BaseTranslationsType
		) {
			if ( !localTranslations ) {
				const localTranslationsString = window.localStorage.getItem(`${languageKey}_${language}`);

				if ( localTranslationsString ) {
					return JSON.parse(localTranslationsString);
				}
			}

			return localTranslations;
		},
		onLanguageChange(language: string) {
			window.localStorage.setItem(languageKey, language)
		}
	} : {}
}
