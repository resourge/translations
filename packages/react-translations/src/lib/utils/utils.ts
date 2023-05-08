import { type BaseTranslationsType, type TranslationsType } from '@resourge/translations';

import { type SetupReactTranslationInstance } from '../types/types';

export type WrapPromiseReturn<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = {
	promise: Promise<SetupReactTranslationInstance<Langs, Trans>>
	read: () => SetupReactTranslationInstance<Langs, Trans>
}

export const wrapPromise = <
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>(
	promise: Promise<SetupReactTranslationInstance<Langs, Trans>>
): WrapPromiseReturn<Langs, Trans> => {
	let status = 'pending';
	let result: any;
	const suspend = promise.then(
		(res) => {
			status = 'success';
			result = res;
		},
		(err) => {
			status = 'error';
			result = err;
		}
	);
	return {
		promise,
		read() {
			if (status === 'pending') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw suspend;
			}
			else if (status === 'error') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw result;
			}
			return result;
		}
	};
};
