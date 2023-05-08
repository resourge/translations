/* eslint-disable @typescript-eslint/ban-types */
import type { OnlyNestedKeyOf } from './FormKey'
import type { PathValue } from './PathValue'
import type { BaseTranslationsType, GetValueFromTemplateString, TranslationsType } from './TranslationTypes'

type GetResults<
	T extends Record<string, any>,
	Key extends keyof T | OnlyNestedKeyOf<T>
> = GetValueFromTemplateString<
	PathValue<
		T, 
		Key
	>
>

type PossibleParameters<T> = T extends (...args: any[]) => void ? Parameters<T>[number] : undefined 

export type TFunctionValues<
	T extends Record<string, any>,
	Key extends keyof T | OnlyNestedKeyOf<T>
> = PossibleParameters<GetResults<T, Key>>

type PossibleReturn<T> = T extends (...args: any[]) => void ? ReturnType<T> : T 

export type TFunctionReturn<
	T extends Record<string, any>,
	Key extends keyof T | OnlyNestedKeyOf<T>
> = PossibleReturn<GetResults<T, Key>>

export type ConvertTransIntoSimpleObj<
	Langs extends string,
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = {
	[K in Exclude<keyof Trans, '_custom'>]: Trans[K] extends Record<string, any> 
		? (
			keyof Trans[K] extends Langs 
				? Trans[K][Langs] 
				: '_custom' extends keyof Trans[K] ? K : ConvertTransIntoSimpleObj<Langs, Trans[K]> 
		) : Trans[K]
}
