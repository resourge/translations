
import {
	SetupTranslations,
	type BaseTranslationsType,
	type SetupTranslationsConfig,
	type SetupTranslationsConfigLoad,
	type SetupTranslationsConfigTranslations,
	SetupTranslationsInstance,
	type TranslationsType
} from '@resourge/translations';
import { type Ref, inject } from 'vue'

export type SetupVueTranslationInstance<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = SetupTranslationsInstance<Langs, Trans> & {
	TranslationsSymbol: symbol
}

export type SetupVueTranslationReturn<Instance> = {
	TranslationInstance: Instance
	useTranslation: () => Omit<Instance, 'language'> & {
		language: Ref<string>
	}
}

let id = 0;

function wrapProxy(state: Record<string, any>) {
	return new Proxy(state, {
		get: (_target, key) => {
			return _target[key as keyof typeof state] ?? (_target.value ? _target.value[key] : undefined)
		}
	})
}

export function SetupVueTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs>
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): SetupVueTranslationReturn<SetupVueTranslationInstance<Langs, Trans>>
export function SetupVueTranslations<
	Langs extends string, 
	Trans extends BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<Trans>
): SetupVueTranslationReturn<SetupVueTranslationInstance<Langs, Trans>>
export function SetupVueTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & (
		Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
	)
): SetupVueTranslationReturn<SetupVueTranslationInstance<Langs, Trans>> {
	const TranslationInstance = SetupTranslations(config as any) as unknown as SetupVueTranslationInstance<
		Langs,
		Trans
	>;

	TranslationInstance.TranslationsSymbol = Symbol(`translationsProviderIdentifier${id++}`);

	return {
		TranslationInstance,
		useTranslation() {
			const context = inject<
				Pick<
					SetupVueTranslationInstance<Langs, Trans>,
					'languages' |
					'language' |
					'T'
				>
			>(TranslationInstance.TranslationsSymbol);

			if ( !context ) {
				throw new Error('useTranslation can only be used in the context of a <TranslationProvider> component.');
			}

			const { 
				languages,
				language,
				T
			} = context

			return Object.setPrototypeOf(
				{
					...TranslationInstance,
					languages: wrapProxy(languages),
					T: wrapProxy(T),
					language
				},
				SetupTranslationsInstance.prototype
			);
		}
	}
}
