import { type Context } from 'react'

import { type BaseTranslationsType, type SetupTranslationsInstance, type TranslationsType } from '@resourge/translations'

import { type WrapPromiseReturn } from '../utils/utils'

export type SetupReactTranslationInstance<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = Omit<SetupTranslationsInstance<Langs, Trans>, 'promise'> & {
	Context: Context<{
		instance: SetupReactTranslationInstance<Langs, Trans>
	}>
	promise: Promise<SetupReactTranslationInstance<Langs, Trans>>
	wrapPromise: WrapPromiseReturn<Langs, Trans>
}
