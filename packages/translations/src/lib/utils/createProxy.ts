import type { BaseTranslationsKeys, BaseTranslationsType } from '../types/TranslationTypes'

import { createKeyFunction } from './utils';

export const createProxy = <T extends BaseTranslationsType>(
	translations: Record<string, string>,
	structure: Record<string, any>,

	onMissingKeyRequest: () => void,

	baseKey: string = ''
): BaseTranslationsKeys<T> => {
	return new Proxy<any>({}, {
		get(_, _key: string) {
			const key = `${baseKey ? `${baseKey}.` : ''}${_key}`;
			const structureValue = structure[_key];
			const translation = translations[key];

			if ( !translation && !structureValue ) {
				onMissingKeyRequest();
				return key
			}

			if ( translation ) {
				return createKeyFunction(translation)
			}

			if ( structureValue ) {
				if ( /\{\{.*\}\}/g.test(structureValue) ) {
					return () => {
						onMissingKeyRequest();
						return key
					}
				}
				onMissingKeyRequest();
				return key
			}

			return createProxy(
				translations, 
				structureValue, 
				onMissingKeyRequest,
				key
			)
		}
	}) 
}
