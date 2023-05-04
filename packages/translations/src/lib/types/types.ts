/* eslint-disable @typescript-eslint/ban-types */
import type { FormKey } from './FormKey'
import type { PathValue } from './PathValue'
import type { BaseTranslationsType, GetParamsFromTemplateString } from './TranslationTypes'

export type TFunction<B extends BaseTranslationsType> = {
	<K extends FormKey<B>>(key: K, ...args: {} extends GetParamsFromTemplateString<B[K]> ? [] : [values: GetParamsFromTemplateString<B[K]>]): PathValue<B, K>
	(key: string, value?: Record<string, any>): string
}
