/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type TranslationsType } from '../types';
import { type BaseTranslationsType } from '../types/TranslationTypes';
import { type ConvertTransIntoKeyStructure } from '../types/types';

export const createTranslationKeyStructure = <
	Langs extends string, 
	T extends TranslationsType<Langs> | BaseTranslationsType
>(
	langs: Langs[],
	translations: T,
	baseKey: string = ''
) => {
	const language = langs[0];

	return Object.keys(translations)
	.reduce<ConvertTransIntoKeyStructure<Langs, T>>((obj, key) => {
		const newKey = `${baseKey ? `${baseKey}.` : ''}${key}`

		const value = (translations as any)[key]
		const keyValues = Object.keys(value);

		(obj as any)[key] = typeof value === 'string' || keyValues.includes(language) || keyValues.includes('_custom') 
			? newKey 
			: createTranslationKeyStructure<Langs, T>(langs, value, newKey);

		return obj;
	}, {} as ConvertTransIntoKeyStructure<Langs, T>);
}
