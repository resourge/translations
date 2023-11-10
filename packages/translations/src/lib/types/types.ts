/* eslint-disable @typescript-eslint/ban-types */
import type { BaseTranslationsType, TranslationsType } from './TranslationTypes'

type CreateKeyPath<K, BaseKey extends string | undefined> = `${BaseKey extends string ? `${BaseKey}.` : ''}${K extends string ? K : ''}`

export type ConvertTransIntoKeyStructure<
	Langs extends string,
	Trans extends TranslationsType<Langs> | BaseTranslationsType,
	BaseKey extends string | undefined = undefined
> = {
	[K in keyof Trans]: Trans[K] extends Record<string, any> 
		? (
			keyof Trans[K] extends Langs 
				? CreateKeyPath<K, BaseKey>
				: '_custom' extends keyof Trans[K] 
					? CreateKeyPath<K, BaseKey> 
					: ConvertTransIntoKeyStructure<Langs, Trans[K], CreateKeyPath<K, BaseKey>> 
		) : CreateKeyPath<K, BaseKey>
}
