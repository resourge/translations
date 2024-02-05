/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Utils } from '../utils/utils'

import type { CustomType } from './customMethods'

export type TranslationsTypeGender<
	Langs extends string
> = {
	female: Record<Langs, string>
	male: Record<Langs, string>
}

export const gender = <Langs extends string, const Trans extends TranslationsTypeGender<Langs>>(
	langs: Trans
): Trans & CustomType<'gender', 'gender', keyof Trans> => {
	return {
		_custom: {
			name: 'gender',
			key: 'gender',
			type: 0
		},
		...langs as object
	} as Trans & CustomType<'gender', 'gender', keyof Trans>
}

Utils.addCustomMethods<TranslationsTypeGender<string>>('gender', (value) => {
	return function ({ gender, ...params }: { gender: keyof TranslationsTypeGender<string> }) {
		const langValue = gender === 'female' ? value.female : value.male

		return Utils.replaceParams(langValue, params)
	}
})
