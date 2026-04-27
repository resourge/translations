export type WrapPromiseReturn = {
	promise: Promise<any>
	read: () => any /* SetupReactTranslationInstance<Langs, Trans> */
};

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
		(error) => {
			status = 'error';
			result = error;
		}
	);
	return {
		promise,
		read() {
			if (status === 'pending') {
				// eslint-disable-next-line @typescript-eslint/only-throw-error
				throw suspend;
			}
			else if (status === 'error') {
				throw result;
			}
			return result;
		}
	};
};
