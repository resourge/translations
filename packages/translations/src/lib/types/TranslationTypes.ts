/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
export type Narrow<T> =
  | (T extends infer U ? U : never)
  | Extract<T, number | string | boolean | bigint | symbol | null | undefined | []>
  | ([T] extends [[]] ? [] : { [K in keyof T]: Narrow<T[K]> })

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

type ConvertStringIntoType<T> = 
	T extends 'string' 
		? string 
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
								: Primitive

type Replace<S extends string, F extends string, T extends string> = S extends `${infer BS}${F}${infer AS}` ? `${BS}${T}${AS}` : S

type GetType<K extends string> = K extends `${infer E}:${infer T}` 
	? [Replace<E, '?', ''>, ConvertStringIntoType<Trim<T>>, E extends `${infer _T}?` ? true : false] 
	: [Replace<K, '?', ''>, Primitive, K extends `${infer _T}?` ? true : false]

type CreateObj<T extends [string, any, boolean]> = T[2] extends true 
	? { [Key in T[0]]?: T[1] } 
	: { [Key in T[0]]: T[1] } 

type GetValuesFromString<K> = K extends string 
	? CreateObj<GetType<K>> : never
	
export type GetParamsFromTemplateString<K> = K extends string 
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

export type GetValueFromTemplateString<Value> = Value extends string 
	? (
		DoesStringContainsInterpolation<Value> extends true ? ((params: GetParamsFromTemplateString<Value>) => Value) : Value
	) : Value

type GetValueFromCustom<
	Langs extends string,
	O extends Record<string, any>, 
	T extends Omit<O, '_custom'> = Omit<O, '_custom'>
> = (
	params: Omit<
		GetParamsFromTemplateString<
			T[keyof T][Langs]
		>,
		O['_custom']['key']
	> & { 
		[K in O['_custom']['key']]: O['_custom']['type'] 
	}
) => T[keyof T][Langs]

export type TranslationsKeys<
	Langs extends string,
	T extends Record<string, any>, 
	BaseKey extends string | undefined = undefined
> = {
	[K in keyof T]: '_custom' extends keyof T[K]
		? GetValueFromCustom<Langs, T[K]>
		: Langs extends keyof T[K]
			? GetValueFromTemplateString<T[K][Langs]>
			: TranslationsKeys<Langs, T[K], `${BaseKey extends string ? `${BaseKey}.` : ''}${K extends string ? K : ''}`>
}

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

type TranslationsWithoutLangs<T extends object, Langs extends string> = { 
	[K in keyof T]: T[K]
} & {
	[K in Langs]?: never
}

export type TranslationsType<
	Langs extends string
> = {
	[k: string]: Record<Langs, string> | (
		TranslationsWithoutLangs<
			TranslationsType<Langs> | (
				TranslationsType<Langs> & { 
					_custom: { key: string, type: any } 
				}
			), 
			Langs
		>
	)
}
