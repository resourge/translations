/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type CustomType } from '../custom';
import { type Narrow, type TranslationsKeys, type TranslationsType } from '../types';

import { Utils, createKeyFunction } from './utils';

const createCustomFunction = <T extends CustomType>(value: T) => {
	return Utils.getCustomMethods(value._custom.name, value)
}

export const createTranslationEntry = <Langs extends string, T extends TranslationsType<Langs>>(
	language: string,
	translations: Narrow<T>
): TranslationsKeys<Langs, T> => {
	return Object.keys(translations)
	.reduce<TranslationsKeys<Langs, T>>((obj, key) => {
		const value = (translations as any)[key]
		const keyValues = Object.keys(value);

		if ( keyValues.includes(language) ) {
			const langValue = value[language];

			(obj as any)[key] = createKeyFunction(langValue);
		}
		else if ( keyValues.includes('_custom') ) {
			const removeLang = (value: Record<string, any>): Record<string, any> & CustomType => {
				return Object.keys(value)
				.reduce<Record<string, any> & CustomType>((obj, key) => {
					const val = value[key];
					if ( typeof val === 'object' ) {
						const keyValues = Object.keys(val);
						if ( keyValues.includes(language) ) {
							(obj as any)[key] = val[language];
						}
						else {
							obj[key] = removeLang(val);
						}
					}
					else {
						obj[key] = val;
					}
					return obj;
				}, { } as Record<string, any> & CustomType)
			}
			(obj as any)[key] = createCustomFunction(removeLang(value))
		}
		else {
			(obj as any)[key] = createTranslationEntry(language, value)
		}

		return obj;
	}, {} as TranslationsKeys<Langs, T>);
}
