import { type ReactNode, useEffect, useState } from 'react';

import { ComponentsContext, type ComponentsContextType, convertComponentsIntoObjectComponents } from '../../contexts/ComponentsContext';
import { type SetupReactTranslationInstance } from '../../types/types';

export type TranslationProviderProps = Partial<ComponentsContextType> & {
	children: ReactNode
	TranslationInstance: SetupReactTranslationInstance<
		any,
		any
	>
};

const TranslationProvider = ({
	children, components = {}, TranslationInstance
}: TranslationProviderProps) => {
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
		});

		const languageChangeRemove = TranslationInstance.addEventListener('languageChange', function () {
			setValue({
				instance: TranslationInstance
			});
		});

		return () => {
			missingRequestKeysRemove();
			languageChangeRemove();
			TranslationInstance.onDestroy();
		};
	}, [TranslationInstance]);

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
