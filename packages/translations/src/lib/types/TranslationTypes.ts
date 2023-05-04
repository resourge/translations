/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
export type Narrow<T> =
  | (T extends infer U ? U : never)
  | Extract<T, number | string | boolean | bigint | symbol | null | undefined | []>
  | ([T] extends [[]] ? [] : { [K in keyof T]: Narrow<T[K]> })

type UnifyObj<T extends Record<string, any>> = {
	[Key in keyof T]: T[Key]
}

type SeparateKey<K> = K extends string 
	? (
		K extends `${infer E}?` 
			? { [Key in E]?: string } 
			: (
				{ [Key in K]: string }
			)
	) : never
	
export type GetParamsFromTemplateString<K> = K extends string 
	? (
		K extends `${infer B}{{${infer E}}}${infer A}` 
			? (
				UnifyObj<SeparateKey<E> & GetParamsFromTemplateString<B> & GetParamsFromTemplateString<A>>
			) : {}
	) : {}

type StringContainsInterpolation<K> = K extends string 
	? (
		K extends `${infer _B}{{${infer _E}}}${infer _A}` ? true : false
	)
	: false

export type GetValueFromTemplateString<Value> = Value extends string 
	? (
		StringContainsInterpolation<Value> extends true ? ((params: GetParamsFromTemplateString<Value>) => Value) : Value
	) : Value

type GetValueFromCustom<
	Langs extends string,
	O extends Record<string, any>, 
	T extends Omit<O, '_custom'> = Omit<O, '_custom'>
> = (params: GetParamsFromTemplateString<T[keyof T][Langs]> & { [K in O['_custom']['key']]: O['_custom']['type'] }) => T[keyof T][Langs]

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
	[k: string]:
	Record<Langs, string> | { [K in Langs]: string } | (
		TranslationsWithoutLangs<TranslationsType<Langs> | (TranslationsType<Langs> & { _custom: { key: string, type: any } }), Langs>
	)
}
