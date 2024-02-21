import type { TranslationPlugin } from '../types/configTypes';

const getNavigatorLanguage = (): string | undefined => {
	if (typeof navigator !== 'undefined') {
		if ((navigator as { userLanguage?: string }).userLanguage) {
			return (navigator as { userLanguage?: string }).userLanguage;
		}
		if (navigator.language) {
			return navigator.language;
		}
		if ( navigator.languages ) { // chrome only; not an array, so can't use .push.apply instead of iterating
			return navigator.languages[0];
		}
	}
	return undefined;
}

export const navigatorLanguageDetector = (options?: { onLanguage: (language: string) => string }): TranslationPlugin => {
	return {
		config(config) {
			if ( !config.language ) {
				const _language = getNavigatorLanguage();

				if ( _language ) {
					const language = options?.onLanguage ? options?.onLanguage(_language) : _language;

					config.language = config.langs.includes(language) ? language : config.defaultLanguage;
				}
			}

			return config;
		}
	}
}
