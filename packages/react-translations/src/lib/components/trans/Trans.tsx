import {
	type ReactElement,
	type ReactNode,
	cloneElement,
	createElement,
	type FC
} from 'react'

import HTML from 'html-parse-stringify';

import { convertComponentsIntoObjectComponents, useComponentsContext } from '../../contexts/ComponentsContext';

function mapAst(ast: HTMLAstNode[], components: Record<string, ReactElement>) {
	return ast
	.map((node, index): ReactNode => {
		if ( node.type === 'text' ) {
			return node.content
		}
		if ( node.type === 'tag' ) {
			const component = components[node.name]

			if ( component ) {
				return cloneElement(
					component, 
					{
						key: `${node.name}-${index}`,
						...node.attrs
					},
					...mapAst(node.children, components)
				)
			}

			return createElement(
				'missing-translation-tag', 
				{
					key: `missingTag-${index}`,
					tag: node.name
				},
				...mapAst(node.children, components)
			);
		}

		return null
	})
}

export type TransProps = {
	message: string
	components?: readonly ReactElement[] | Readonly<Record<string, ReactElement>>
}

const Trans: FC<TransProps> = ({ message, components = {} }) => {
	const { components: defaultComponents } = useComponentsContext();

	const _components: Record<string, ReactElement> = {
		...defaultComponents,
		...convertComponentsIntoObjectComponents(components)
	};

	return (
		<>
			{ 
				mapAst(
					HTML.parse(`<>${message}</>`), 
					_components
				) 
			}
		</>
	);
};

Trans.displayName = 'Trans';

export default Trans;
