type ConvertStringIntoType<T> = 
	T extends string 
		? T
		: T extends number 
			? 'number' 
			: T extends bigint 
				? 'bigint' 
				: T extends boolean 
					? 'boolean' 
					: T extends null 
						? 'null' 
						: T extends symbol 
							? 'symbol' 
							: T extends undefined 
								? 'undefined' 
								: ''

export type CustomType<
	Key extends string, 
	Type,
	Langs extends string
> = {
	[K in Langs]: {
		langs: Langs
		trans: `{{${Key}:${ConvertStringIntoType<Type>}}}`
	}
}
