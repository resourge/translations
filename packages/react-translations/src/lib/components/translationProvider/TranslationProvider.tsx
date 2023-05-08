import React, { type ReactNode, useEffect, useState } from 'react';

import { type BaseTranslationsType, type TranslationsType } from '@resourge/translations';

import { ComponentsContext, convertComponentsIntoObjectComponents, type ComponentsContextType } from '../../contexts/ComponentsContext';
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
} & Partial<ComponentsContextType>

function TranslationProvider<
	Langs extends string, 
	Trans extends TranslationsType<Langs> | BaseTranslationsType
>({
	TranslationInstance, children, components = {}
}: TranslationProviderProps<Langs, Trans>) {
	const _instance = TranslationInstance.wrapPromise.read();
			
	const [value, setValue] = useState({
		instance: _instance
	});

	const [ComponentsContextValue] = useState<ComponentsContextType>(() => ({
		components: convertComponentsIntoObjectComponents(components)
	}));

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
			<ComponentsContext.Provider value={ComponentsContextValue}>
				{ children }
			</ComponentsContext.Provider>
		</TranslationInstance.Context.Provider>
	);
};

TranslationProvider.displayName = 'TranslationProvider';

export default TranslationProvider;
