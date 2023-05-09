
function visit(result: any, cb: (result: any) => boolean): boolean {
	const finish = cb(result);

	if (finish) {
		return true;
	}

	return Object.keys(result)
	.some((key) => {
		const value = result[key];

		if (Array.isArray(value)) {
			return value.some((val) => visit(val, cb))
		}
		else if (typeof value === 'object') {
			return visit(value, cb)
		}
		return false;
	})
}

export function find(result: any, cb: (result: any) => boolean) {
	return new Promise((resolve) => {
		visit(result, (value) => {
			const finish = cb(value)
			if (finish) {
				resolve(value);
			}
			return finish;
		});

		resolve(null);
	})
}
