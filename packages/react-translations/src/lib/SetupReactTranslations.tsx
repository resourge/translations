/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createContext, useContext } from 'react'

import {
	SetupTranslations,
	type BaseTranslationsType,
	type SetupTranslationsConfig,
	type SetupTranslationsConfigLoad,
	type SetupTranslationsConfigTranslations,
	type TranslationsType
} from '@resourge/translations'

import { type SetupReactTranslationInstance } from './types/types'
import { wrapPromise } from './utils/utils'

export type SetupReactTranslationsReturn<Instance, B> = {
	B: B
	TranslationInstance: Instance
	useTranslation: () => Instance
}

export function SetupReactTranslations<
	Langs extends string, 
	const Trans extends TranslationsType<Langs>
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): SetupReactTranslationsReturn<SetupReactTranslationInstance<Langs, Trans>, Trans>
export function SetupReactTranslations<
	Langs extends string, 
	const Trans extends BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<Trans>
): SetupReactTranslationsReturn<SetupReactTranslationInstance<Langs, Trans>, undefined>
export function SetupReactTranslations<
	Langs extends string, 
	const Trans extends TranslationsType<Langs> | BaseTranslationsType
>(
	config: SetupTranslationsConfig<Langs> & (
		Trans extends TranslationsType<Langs> ? SetupTranslationsConfigTranslations<Langs, Trans> : SetupTranslationsConfigLoad<Trans>
	)
): SetupReactTranslationsReturn<SetupReactTranslationInstance<Langs, Trans>, Trans extends TranslationsType<Langs> ? Trans : undefined> {
	const B = (config as unknown as SetupTranslationsConfigTranslations<Langs, TranslationsType<Langs>>).translations
	const TranslationInstance = SetupTranslations<Langs, Trans>(
		config as any
	) as unknown as SetupReactTranslationInstance<
		Langs,
		Trans
	>;

	TranslationInstance.wrapPromise = wrapPromise(TranslationInstance.promise)
	TranslationInstance.Context = createContext<any>(null!);

	return {
		TranslationInstance,
		useTranslation() {
			const context = useContext(TranslationInstance.Context);

			if ( !context ) {
				throw new Error('useTranslation can only be used in the context of a <TranslationProvider> component.');
			}

			return context.instance;
		},
		B: B as Trans extends TranslationsType<Langs> ? Trans : undefined
	}
}
