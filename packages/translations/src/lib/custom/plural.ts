import { CustomMethods } from '../utils/utils'

export const plural = CustomMethods.add<
	'count',
	{
		one: string
		other: string
		two?: string
		zero?: string
	},
	number
>(
	'count', 
	(value, params) => {
		const count = params.count;
		let langValue;
		if ( count === 0 ) {
			langValue = value.zero;
		}
		else if ( count === 1 ) {
			langValue = value.one;
		}
		else if ( count === 2 ) {
			langValue = value.two;
		}

		return langValue ?? value.other;
	}
)
