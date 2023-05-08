import { type ReactElement, createContext, useContext } from 'react';

export type ComponentsContextType = {
	components: readonly ReactElement[] | Readonly<Record<string, ReactElement>>
}

export const ComponentsContext = createContext<ComponentsContextType>({
	components: { }
})

export const convertComponentsIntoObjectComponents = (components: ComponentsContextType['components']) => {
	return components 
		? Array.isArray(components) 
			? components.reduce((obj, component: ReactElement) => {
				obj[component.type as keyof typeof obj] = component;
				return obj;
			}, {})
			: components
		: {}
}

export const useComponentsContext = () => useContext(ComponentsContext)
