export type CustomType<Name = string, Key = string, Type = string> = { 
	_custom: {
		key: Key
		name: Name
		type: Type
	} 
}
