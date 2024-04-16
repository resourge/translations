/// <reference types="vite/client" />
/// <reference types="vitest" />

type TagNode = {
	attrs: Record<string, string>
	children: HTMLAstNode[]
	name: string
	type: 'tag'
	voidElement: boolean
}

type TextNode = {
	content: string
	type: 'text'
}

type ComponentNode = {
	attrs: Record<string, string>
	children: []
	name: string
	type: 'component'
	voidElement: boolean
}

type HTMLAstNode = ComponentNode | TagNode | TextNode

declare type Htmlparsestringify = {
	parse: (htmlString: string, options?: any) => HTMLAstNode[]
	stringify: (AST: HTMLAstNode[]) => string
}

declare module 'html-parse-stringify' {
	export default null as Htmlparsestringify
}
