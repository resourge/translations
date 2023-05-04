/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { Narrow } from '../types/TranslationTypes'
import { Utils } from '../utils/utils'

import type { CustomType } from './customMethods'

export type TranslationsTypePlural<
	Langs extends string
> = {
	one: Record<Langs, string>
	other: Record<Langs, string>
	two?: Record<Langs, string>
	zero?: Record<Langs, string>
}

export const plural = <Langs extends string, T extends TranslationsTypePlural<Langs>>(
	langs: Narrow<T>
): T & CustomType<'plural', 'count', number> => {
	return {
		_custom: {
			name: 'plural',
			key: 'count',
			type: 0
		},
		...langs as object
	} as T & CustomType<'plural', 'count', number>
}

Utils.addCustomMethods<TranslationsTypePlural<string>>('plural', (value) => {
	return function ({ count, ...params }: { count: number }) {
		let langValue;
		if ( count === 0 ) {
			langValue = value.zero;
		}
		else if ( count === 1 ) {
			langValue = value.one;
		}
		else if ( count === 2 ) {
			langValue = value.two;
		}

		langValue = langValue ?? value.other;

		return Utils.replaceParams(langValue, params)
	}
})
