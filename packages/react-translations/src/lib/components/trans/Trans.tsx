import {
	cloneElement,
	createElement,
	type FC,
	type ReactElement,
	type ReactNode
} from 'react';

import HTML from 'html-parse-stringify';

import { convertComponentsIntoObjectComponents, useComponentsContext } from '../../contexts/ComponentsContext';

export type TransProps = {
	components?: Readonly<Record<string, ReactElement>> | readonly ReactElement[]
	message: string
};

function mapAst(ast: HTMLAstNode[], components: Record<string, ReactElement>) {
	return ast
	.map((node, index): ReactNode => {
		if ( node.type === 'text' ) {
			return node.content;
		}
		if ( node.type === 'tag' ) {
			if ( node.name === 'firstComponent' ) {
				return mapAst(node.children, components);
			}
			const component = components[node.name];

			if ( component ) {
				return cloneElement(
					component, 
					{
						key: `${node.name}-${index}`,
						...node.attrs
					},
					...mapAst(node.children, components)
				);
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

		return null;
	});
}

const Trans: FC<TransProps> = ({ components = {}, message }) => {
	const { components: defaultComponents } = useComponentsContext();

	const _components: Record<string, ReactElement> = {
		...defaultComponents,
		...convertComponentsIntoObjectComponents(components),
		firstComponent: <div />
	};

	return (
		<>
			{ 
				mapAst(
					HTML.parse(`<firstComponent>${message}</firstComponent>`), 
					_components
				) 
			}
		</>
	);
};

Trans.displayName = 'Trans';

export default Trans;
