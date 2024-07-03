/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { BaseTranslationsType, TranslationsType } from '../types/TranslationTypes';
import type {
	OnTranslationConfig,
	OnTranslationGet,
	OnTranslationSet,
	SetupTranslationsConfig,
	SetupTranslationsConfigLoad,
	SetupTranslationsConfigTranslations,
	TranslationPlugin
} from '../types/configTypes';
import { type CustomType } from '../types/customMethods';
import { type ConvertStringIntoType } from '../types/types';

type UnionToIntersection<U> = (
	U extends never ? never : (arg: U) => never
) extends (arg: infer I) => void
	? I
	: never;

type UnionToTuple<T> = UnionToIntersection<
  T extends never ? never : (t: T) => T
> extends (_: never) => infer W
	? [...UnionToTuple<Exclude<T, W>>, W]
	: [];

type TupleToString<T extends any[]> = T extends [infer First, ...infer Rest]
	? `${First extends string ? First : ''}${Rest extends [] ? '' : ','}${TupleToString<Rest>}`
	: '';

const DefaultUtils = {
	customMethods: new Map(),
	add<
		Key extends string,
		T extends Record<string, string>,
		Type = TupleToString<UnionToTuple<keyof T>>
	>(
		key: Key, 
		cb: (value: T, params: Record<Key, ConvertStringIntoType<Type>>) => string
	) {
		DefaultUtils.customMethods.set(key, (value: T) => {
			return function (params: Record<Key, ConvertStringIntoType<Type>>) {
				const langValue = cb(value, params);

				return DefaultUtils.replaceParams(langValue, params)
			}
		});

		// T1 makes sure autocomplete works
		return <
			Langs extends string,
			T1 extends Record<string, Record<Langs, string>>
		>(trans: T1) => ({
			_custom: {
				name: key,
				key
			},
			...trans
		}) as unknown as CustomType<
			Key,
			Type,
			keyof T1[keyof T1] extends string ? keyof T1[keyof T1] : Langs
		>
	},
	replaceParams: (langValue: string, params: any) => {
		return langValue.replace(/\{{([^{}]+)\}}/g, (_: string, key: string) => {
			const value: string | undefined = params[key]
			return value !== null && value !== undefined ? value : '';
		})
	},
	get(name: string, value: any) {
		const method = DefaultUtils.customMethods.get(name);
		if ( method ) {
			return method(value)
		}
		const defaultKey = Object.keys(value).find((key) => key !== '_custom');

		return () => defaultKey
	}
} 
export const CustomMethods = DefaultUtils as {
	add: <
		Key extends string, 
		T extends Record<string, string>, 
		Type = TupleToString<UnionToTuple<keyof T>>
	>(
		key: Key, 
		cb: (value: T, params: Record<Key, ConvertStringIntoType<Type>>) => string
	) => <
		Langs extends string, 
		T1 extends Record<string, Record<Langs, string>>
	>(trans: T1) => CustomType<
		Key,
		Type,
		keyof T1[keyof T1] extends string ? keyof T1[keyof T1] : Langs
	>
	get: (name: string, value: any) => any
	replaceParams: (langValue: string, params: any) => string
}

/**
 * Convert string into function if it contains "params"
 */
export const createKeyFunction = (langValue: string) => {
	if ( /\{\{.*\}\}/g.test(langValue) ) {
		return function (params: any) {
			return CustomMethods.replaceParams(langValue, params)
		}
	}
	return langValue;
}

export function isExpired(lastTime: number, threshold: number) {
	const now = Date.now();

	return (now - lastTime >= threshold);
}

export function separatePlugins<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & (
		Trans extends TranslationsType<Langs> 
			? SetupTranslationsConfigTranslations<Langs, Trans> 
			: SetupTranslationsConfigLoad<Trans>
	)
) {
	const plugins = config.plugins ?? [];
	
	const onLanguageChanges: Array<NonNullable<TranslationPlugin['onLanguageChange']>> = [];
	const configs: Array<OnTranslationConfig<Langs, Trans>> = [];
	const onTranslationGets: Array<OnTranslationGet<Langs, Trans>> = [];
	const onTranslationSets: Array<OnTranslationSet<Langs, Trans>> = [];

	plugins.forEach(({
		config, onLanguageChange, onTranslationGet, onTranslationSet 
	}) => {
		if ( config ) {
			configs.push(config as unknown as OnTranslationConfig<Langs, Trans>);
		}
		if ( onLanguageChange ) {
			onLanguageChanges.push(onLanguageChange);
		}
		if ( onTranslationGet ) {
			onTranslationGets.push(onTranslationGet as unknown as OnTranslationGet<Langs, Trans>);
		}
		if ( onTranslationSet ) {
			onTranslationSets.push(onTranslationSet as OnTranslationSet<Langs, Trans>);
		}
	})

	return {
		onLanguageChanges,
		configs,
		onTranslationGets,
		onTranslationSets
	}
}

export const deepValue = (o: Record<string, any>, p: string) => p
.split('.')
.reduce((a, v) => a === undefined ? undefined : a[v], o);
