import type { TranslationPlugin } from '../types/configTypes';

const onLanguageChanges: Array<(language: string) => Promise<any>> = [];

export const htmlLanguage = globalThis.window ? (): TranslationPlugin => {
	let _onLanguageChange: ((language: string) => Promise<any>) | undefined;
	return {
		config(config, changeLanguage) {
			_onLanguageChange = changeLanguage;

			onLanguageChanges.push(_onLanguageChange)

			document.documentElement.setAttribute('lang', config.language);
			return config;
		},
		onLanguageChange(language) {
			document.documentElement.setAttribute('lang', language);

			onLanguageChanges
			.filter((onLanguageChange) => onLanguageChange !== _onLanguageChange)
			.forEach((onLanguageChange) => {
				onLanguageChange(language)
			});
		},
		onDestroy() {
			if ( _onLanguageChange ) {
				const index = onLanguageChanges.indexOf(_onLanguageChange);

				onLanguageChanges.splice(index, 1)
			}
		}
	}
} : () => ({})
