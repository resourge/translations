import type { TranslationsType, BaseTranslationsType } from '../types/TranslationTypes';
import type { TranslationObj, TranslationPlugin } from '../types/configTypes';

export const languageLocalStorage = <
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
>(): TranslationPlugin<Langs, B, Trans> => {
	const languageKey = 'lng'

	return globalThis.window ? {
		config(config) {
			config.language = window.localStorage.getItem(languageKey) ?? config.language;

			return config;
		},
		onTranslationSet(language: string, translations: any) {
			window.localStorage.setItem(`${languageKey}_${language}`, JSON.stringify(translations));
		},
		onTranslationGet(
			language: string,  
			localTranslations?: TranslationObj<Langs, Trans>
		) {
			if ( !localTranslations ) {
				const localTranslationsString = window.localStorage.getItem(`${languageKey}_${language}`);

				if ( localTranslationsString ) {
					return JSON.parse(localTranslationsString) as TranslationObj<Langs, Trans>;
				}
			}

			return localTranslations;
		},
		onLanguageChange(language: string) {
			window.localStorage.setItem(languageKey, language)
		}
	} : {}
}
