/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type TranslationsKeys } from '../types';

import { Utils, createKeyFunction } from './utils';

const createCustomFunction = <T extends { _custom: { key: string } }>(value: T) => {
	return Utils.getCustomMethods(value._custom.key, value)
}

export const createTranslationEntry = <Langs extends string, const T extends Record<any, any>>(
	language: string,
	translations: T
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
			const removeLang = (value: Record<string, any>): Record<string, any> & { _custom: { key: string } } => {
				return Object.keys(value)
				.reduce<Record<string, any> & { _custom: { key: string } }>((obj, key) => {
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
				}, { } as Record<string, any> & { _custom: { key: string } })
			}
			(obj as any)[key] = createCustomFunction(removeLang(value))
		}
		else {
			(obj as any)[key] = createTranslationEntry(language, value)
		}

		return obj;
	}, {} as TranslationsKeys<Langs, T>);
}
