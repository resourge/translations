import type { TranslationsType, BaseTranslationsType } from '../types/TranslationTypes';
import type { TranslationObj, TranslationPlugin } from '../types/configTypes';

export const languageLocalStorage = <
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>(): TranslationPlugin<Langs, Trans> => {
	const languageKey = 'lng'

	return globalThis.window ? {
		config(config) {
			config.language = window.localStorage.getItem(languageKey) ?? config.language;

			return config;
		},
		onTranslationSet(language: string, translations: TranslationObj<Langs, Trans>) {
			window.localStorage.setItem(`${languageKey}_${language}`, JSON.stringify(translations));
		},
		onTranslationGet(
			language: string,  
			localTranslations?: Trans
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
