import React, { type ReactNode, useEffect, useState } from 'react';

import { type BaseTranslationsType, type TranslationsType } from '@resourge/translations';

import { type SetupReactTranslationInstance } from '../../types/types';

export type TranslationProviderProps<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
> = {
	children: ReactNode
	TranslationInstance: SetupReactTranslationInstance<
		Langs,
		Trans
	>
}

function TranslationProvider<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>({ TranslationInstance, children }: TranslationProviderProps<Langs, Trans>) {
	const _instance = TranslationInstance.wrapPromise.read();
			
	const [value, setValue] = useState({
		instance: _instance
	});

	useEffect(() => {
		const missingRequestKeysRemove = TranslationInstance.addEventListener('missingRequestKeys', function () {
			setValue({
				instance: TranslationInstance 
			});
		})

		const languageChangeRemove = TranslationInstance.addEventListener('languageChange', function () {
			setValue({
				instance: TranslationInstance
			});
		})

		return () => {
			missingRequestKeysRemove();
			languageChangeRemove();
		}
	}, [TranslationInstance])

	return (
		<TranslationInstance.Context.Provider value={value}>
			{ children }
		</TranslationInstance.Context.Provider>
	);
};

export default TranslationProvider;
