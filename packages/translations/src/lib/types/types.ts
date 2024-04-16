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
				: ConvertTransIntoKeyStructure<Langs, Trans[K], CreateKeyPath<K, BaseKey>> 
		) : CreateKeyPath<K, BaseKey>
}

type StringToUnion<T extends string> = T extends `${infer E},${infer R}`
	? E | StringToUnion<R>
	: T

export type ConvertStringIntoType<T> = 
	T extends 'string' 
		? T 
		: T extends 'number' 
			? number 
			: T extends 'bigint' 
				? bigint 
				: T extends 'boolean' 
					? boolean 
					: T extends 'null' 
						? null 
						: T extends 'symbol' 
							? symbol 
							: T extends 'undefined' 
								? undefined 
								: T extends string
									? StringToUnion<T>
									: T
