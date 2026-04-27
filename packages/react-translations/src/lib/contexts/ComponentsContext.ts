import { createContext, type ReactElement, useContext } from 'react';

export type ComponentsContextType = {
	components: Readonly<Record<string, ReactElement>> | readonly ReactElement[]
};

export const ComponentsContext = createContext<ComponentsContextType>({
	components: { }
});

export const convertComponentsIntoObjectComponents = (components: ComponentsContextType['components']) => {
	return components 
		? Array.isArray(components) 
			? components.reduce((obj, component: ReactElement) => {
				obj[component.type as keyof typeof obj] = component;
				return obj;
			}, {})
			: components
		: {};
};

export const useComponentsContext = () => useContext(ComponentsContext);
