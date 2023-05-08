/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { CustomType } from '../custom/customMethods';
import type {
	BaseTranslationsType,
	Narrow,
	TranslationsKeys,
	TranslationsType
} from '../types/TranslationTypes'
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
		return langValue.replace(/{{(.*)}}/g, (_: string, key: string) => {
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

const createCustomFunction = <T extends CustomType>(value: T) => {
	return Utils.getCustomMethods(value._custom.name, value)
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

export const createFromEntry = <Langs extends string, T extends TranslationsType<Langs>>(
	language: string,
	translations: Narrow<T>
): TranslationsKeys<Langs, T> => {
	return Object.keys(translations)
	.reduce<TranslationsKeys<Langs, T>>((obj, key) => {
		const value = (translations as any)[key]
		const keyValues = Object.keys(value);

		if ( keyValues.includes(language) ) {
			const langValue = value[language];

			(obj as any)[key] = createKeyFunction(langValue);
		}
		else if ( keyValues.includes('_custom') ) {
			const removeLang = (value: Record<string, any>): Record<string, any> & CustomType => {
				return Object.keys(value)
				.reduce<Record<string, any> & CustomType>((obj, key) => {
					const val = value[key];
					if ( typeof val === 'object' ) {
						const keyValues = Object.keys(val);
						if ( keyValues.includes(language) ) {
							(obj as any)[key] = val[language];
						}
						else {
							obj[key] = removeLang(val);
						}
					}
					else {
						obj[key] = val;
					}
					return obj;
				}, { } as Record<string, any> & CustomType)
			}
			(obj as any)[key] = createCustomFunction(removeLang(value))
		}
		else {
			(obj as any)[key] = createFromEntry(language, value)
		}

		return obj;
	}, {} as TranslationsKeys<Langs, T>);
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
	
	const onLanguageChanges: Array<NonNullable<TranslationPlugin<Langs, Trans>['onLanguageChange']>> = [];
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
