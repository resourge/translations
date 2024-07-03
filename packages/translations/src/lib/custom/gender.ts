import { CustomMethods } from '../utils/utils'

export const gender = CustomMethods.add<
	'gender',
	{
		female: string
		male: string
	}
>(
	'gender', 
	(value, params) => params.gender === 'female' ? value.female : value.male
)
