export type WrapPromiseReturn = {
	promise: Promise<any /* SetupReactTranslationInstance<Langs, Trans> */>
	read: () => any /* SetupReactTranslationInstance<Langs, Trans> */
}

export const wrapPromise = <T>(
	promise: Promise<T>
): WrapPromiseReturn => {
	let status = 'pending';
	let result: any;
	const suspend = promise.then(
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
