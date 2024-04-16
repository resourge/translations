/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type IsLiteral } from 'type-fest';

import { type CustomType } from './customMethods';
import { type ConvertStringIntoType } from './types';

type UnifyObj<T extends Record<string, any>> = {
	[Key in keyof T]: T[Key]
}

type Primitive = bigint | boolean | null | number | string | symbol | undefined;

type Separator = ' ';
type Trim<T extends string, Acc extends string = ''> =
(T extends `${infer Char}${infer Rest}`
	? (Char extends Separator
		? Trim<Rest, Acc>
		: Trim<Rest, `${Acc}${Char}`>)
	: (T extends ''
		? Acc
		: never)
)

type Replace<S extends string, F extends string, T extends string> = S extends `${infer BS}${F}${infer AS}` ? `${BS}${T}${AS}` : S

type GetType<K extends string> = K extends `${infer E}:${infer T}` 
	? [Replace<E, '?', ''>, IsLiteral<T> extends true ? ConvertStringIntoType<Trim<T>> : T, E extends `${infer _T}?` ? true : false] 
	: [Replace<K, '?', ''>, Primitive, K extends `${infer _T}?` ? true : false]

type CreateObj<T extends [string, any, boolean]> = T[2] extends true 
	? { [Key in T[0]]?: T[1] } 
	: { [Key in T[0]]: T[1] } 

type GetValuesFromString<K> = K extends string 
	? CreateObj<GetType<K>> : never
	
type GetParamsFromTemplateString<K> = K extends string 
	? (
		K extends `${infer B}{{${infer E}}}${infer A}` 
			? (
				UnifyObj<GetValuesFromString<E> & GetParamsFromTemplateString<B> & GetParamsFromTemplateString<A>>
			) : {}
	) : {}

type DoesStringContainsInterpolation<K> = K extends string 
	? (
		K extends `${infer _B}{{${infer _E}}}${infer _A}` ? true : false
	)
	: false

type GetValueFromTemplateString<Value> = Value extends string 
	? (
		DoesStringContainsInterpolation<Value> extends true 
			? ((params: GetParamsFromTemplateString<Value>) => Value) 
			: Value
	) : Value

export type TranslationsKeys<
	Langs extends string,
	T extends Record<string, any>, 
	BaseKey extends string | undefined = undefined
> = {
	[K in keyof T]: Langs extends keyof T[K]
		? T[K][Langs] extends object
			? GetValueFromTemplateString<T[K][Langs]['trans']>
			: GetValueFromTemplateString<T[K][Langs]>
		: TranslationsKeys<
			Langs, 
			T[K], 
			`${BaseKey extends string ? `${BaseKey}.` : ''}${K extends string ? K : ''}`
		>
}

/*
 keyof T[K] extends '_custom'
		? GetValueFromTemplateString<T[K]['_custom']['trans'][Langs]>
		:
*/

export type BaseTranslationsKeys<
	T extends Record<string, any>, 
	BaseKey extends string | undefined = undefined
> = {
	[K in keyof T]: T[K] extends string
		? GetValueFromTemplateString<T[K]>
		: BaseTranslationsKeys<T[K], `${BaseKey extends string ? `${BaseKey}.` : ''}${K extends string ? K : ''}`>
}

export type BaseTranslationsType = {
	[K: string]: BaseTranslationsType | string
}

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...Array<0>]

export type TranslationsType<Langs extends string, D extends number = 11> = 
[D] extends [never] 
	? never 
	: (
		{
			[key: string]: CustomType<any, any, Langs> | Record<Langs, string> | TranslationsType<Langs, Prev[D]> 
		}
	);
