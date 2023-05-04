/* eslint-disable @typescript-eslint/ban-types */
import type { FormKey } from './FormKey'
import type { PathValue } from './PathValue'
import type { GetValueFromTemplateString, TranslationsKeys } from './TranslationTypes'

type GetResults<
	Langs extends string, 
	T extends Record<string, any>,
	Key extends keyof T | FormKey<T>
> = GetValueFromTemplateString<
	PathValue<
		TranslationsKeys<
			Langs, 
			T
		>, 
		Key
	>
>

type PossibleParameters<T> = T extends (...args: any[]) => void ? Parameters<T>[number] : undefined 

export type TFunctionValues<
	Langs extends string, 
	T extends Record<string, any>,
	Key extends keyof T | FormKey<T>
> = PossibleParameters<GetResults<Langs, T, Key>>

type PossibleReturn<T> = T extends (...args: any[]) => void ? ReturnType<T> : T 

export type TFunctionReturn<
	Langs extends string, 
	T extends Record<string, any>,
	Key extends keyof T | FormKey<T>
> = PossibleReturn<GetResults<Langs, T, Key>>
