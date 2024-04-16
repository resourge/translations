import { Utils } from '../utils/utils'

export const gender = Utils.addCustomMethods<
	'gender',
	{
		female: string
		male: string
	}
>(
	'gender', 
	(value, params) => params.gender === 'female' ? value.female : value.male
)
