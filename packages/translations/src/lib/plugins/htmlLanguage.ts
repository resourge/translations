import type { TranslationPlugin } from '../types/configTypes';

export const htmlLanguage = globalThis.window ? (): TranslationPlugin => {
	return {
		config(config) {
			document.documentElement.setAttribute('lang', config.language);
			return config;
		},
		onLanguageChange(language) {
			document.documentElement.setAttribute('lang', language);
		}
	}
} : () => ({})
