import type { TranslationObj, TranslationPlugin } from '../types/configTypes';
import type { BaseTranslationsType, TranslationsType } from '../types/TranslationTypes';

export const languageLocalStorage = globalThis.window
	? (): TranslationPlugin => {
		const languageKey = 'lng';

		return {
			config(config) {
				config.language = globalThis.localStorage.getItem(languageKey) ?? config.language;

				return config;
			},
			onLanguageChange(language: string) {
				globalThis.localStorage.setItem(languageKey, language);
			},
			onTranslationGet(
				language: string,  
				localTranslations?: BaseTranslationsType | TranslationsType<string>
			) {
				if ( !localTranslations ) {
					const localTranslationsString = globalThis.localStorage.getItem(`${languageKey}_${language}`);

					if ( localTranslationsString ) {
						return JSON.parse(localTranslationsString);
					}
				}

				return localTranslations;
			},
			onTranslationSet(language: string, translations: TranslationObj<string, BaseTranslationsType | TranslationsType<string>>) {
				globalThis.localStorage.setItem(`${languageKey}_${language}`, JSON.stringify(translations));
			}
		};
	}
	: () => ({});
