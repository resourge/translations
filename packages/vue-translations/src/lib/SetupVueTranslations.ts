
import {
	SetupTranslations,
	type BaseTranslationsType,
	type SetupTranslationsConfig,
	type SetupTranslationsConfigLoad,
	type SetupTranslationsConfigTranslations,
	type SetupTranslationsInstance,
	type TranslationsType
} from '@resourge/translations';
import { inject } from 'vue'

export type SetupVueTranslationInstance<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = SetupTranslationsInstance<Langs, Trans> & {
	TranslationsSymbol: symbol
}

export type SetupVueTranslationReturn<Instance> = {
	TranslationInstance: Instance
	useTranslation: () => Instance
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

	TranslationInstance.TranslationsSymbol = Symbol('Translations provider identifier');

	return {
		TranslationInstance,
		useTranslation() {
			const context = inject<{ instance: SetupVueTranslationInstance<Langs, Trans> }>(TranslationInstance.TranslationsSymbol);
			if ( !context ) {
				throw new Error();
			}

			return context.instance;
		}
	}
}
