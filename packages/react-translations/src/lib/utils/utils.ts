export type WrapAuthenticationReturn = {
	promise: () => Promise<any>
	read: () => any
}

export const wrapAuthentication = (
	promise: () => Promise<any>
): WrapAuthenticationReturn => {
	let status = 'pending';
	let result: any;
	const suspend = promise().then(
		(res) => {
			status = 'success';
			result = res;
		},
		(err) => {
			status = 'error';
			result = err;
		}
	);
	return {
		promise,
		read() {
			if (status === 'pending') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw suspend;
			}
			else if (status === 'error') {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw result;
			}
			return result;
		}
	};
};
