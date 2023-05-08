/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createContext, useContext } from 'react'

import {
	type BaseTranslationsType,
	type TranslationsType,
	type SetupTranslationsConfig,
	type SetupTranslationsConfigTranslations, 
	type SetupTranslationsConfigLoad, 
	SetupTranslations
} from '@resourge/translations'

import { type SetupReactTranslationInstance } from './types/types'
import { wrapPromise } from './utils/utils'

export type SetupReactTranslationReturn<Instance> = {
	TranslationInstance: Instance
	useTranslation: () => Instance
}

export function SetupReactTranslation<
	Langs extends string, 
	Trans extends TranslationsType<Langs>
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): SetupReactTranslationReturn<SetupReactTranslationInstance<Langs, Trans>>
export function SetupReactTranslation<
	Langs extends string, 
	Trans extends BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<Trans>
): SetupReactTranslationReturn<SetupReactTranslationInstance<Langs, Trans>>
export function SetupReactTranslation<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & (
		Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
	)
): SetupReactTranslationReturn<SetupReactTranslationInstance<Langs, Trans>> {
	const TranslationInstance = SetupTranslations<Langs, Trans>(
		config as any
	) as unknown as SetupReactTranslationInstance<
		Langs,
		Trans
	>;

	TranslationInstance.wrapPromise = wrapPromise<Langs, Trans>(TranslationInstance.promise)

	TranslationInstance.Context = createContext<{ instance: SetupReactTranslationInstance<Langs, Trans> }>(null!);

	return {
		TranslationInstance,
		useTranslation() {
			const context = useContext(TranslationInstance.Context);

			if ( !context ) {
				throw new Error();
			}

			return context.instance;
		}
	}
}
