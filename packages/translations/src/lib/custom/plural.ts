import { CustomMethods } from '../utils/utils';

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
		switch (count) {
			case 0: {
				langValue = value.zero;
		
				break;
			}
			case 1: {
				langValue = value.one;
		
				break;
			}
			case 2: {
				langValue = value.two;
		
				break;
			}
		// No default
		}

		return langValue ?? value.other;
	}
);
