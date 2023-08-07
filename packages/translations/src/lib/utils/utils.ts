/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { BaseTranslationsType, TranslationsType } from '../types/TranslationTypes'
import type {
	OnTranslationConfig,
	OnTranslationGet,
	OnTranslationSet,
	SetupTranslationsConfig,
	SetupTranslationsConfigLoad,
	SetupTranslationsConfigTranslations,
	TranslationPlugin
} from '../types/configTypes'

type RemoveLang<
	T extends Record<string, Record<string, string>>
> = {
	[K in keyof T]: T[K][keyof T[K]]
}

export const Utils = {
	customMethods: new Map(),
	addCustomMethods<T extends Record<string, Record<string, string>>>(key: string, cb: (value: RemoveLang<T>) => (params: any) => string) {
		Utils.customMethods.set(key, cb);
	},
	replaceParams: (langValue: string, params: any) => {
		return langValue.replace(/\{{([^{}]+)\}}/g, (_: string, key: string) => {
			const value: string | undefined = params[key]
			return value !== null && value !== undefined ? value : '';
		})
	},
	getCustomMethods(name: string, value: any) {
		const method = Utils.customMethods.get(name);
		if ( method ) {
			return method(value)
		}
		const defaultKey = Object.keys(value).find((key) => key !== '_custom');

		return () => defaultKey
	}
}

/**
 * Convert string into function if it contains "params"
 */
export const createKeyFunction = (langValue: string) => {
	if ( /\{\{.*\}\}/g.test(langValue) ) {
		return function (params: any) {
			return Utils.replaceParams(langValue, params)
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
		Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
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

export const deepValue = (o: Record<string, any>, p: string) => p.split('.').reduce((a, v) => a[v], o);
