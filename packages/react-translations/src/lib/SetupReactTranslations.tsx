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

export type SetupReactTranslationsReturn<Instance> = {
	TranslationInstance: Instance
	useTranslation: () => Instance
}

export function SetupReactTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs>
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): SetupReactTranslationsReturn<SetupReactTranslationInstance<Langs, Trans>>
export function SetupReactTranslations<
	Langs extends string, 
	Trans extends BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<Trans>
): SetupReactTranslationsReturn<SetupReactTranslationInstance<Langs, Trans>>
export function SetupReactTranslations<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & (
		Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
	)
): SetupReactTranslationsReturn<SetupReactTranslationInstance<Langs, Trans>> {
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
				throw new Error('useTranslation can only be used in the context of a <TranslationProvider> component.');
			}

			return context.instance;
		}
	}
}
