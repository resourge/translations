/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
	useEffect
} from 'react'

import {
	type BaseTranslationsType,
	type TranslationsType,
	type SetupTranslationsConfig,
	type SetupTranslationsConfigTranslations, 
	type SetupTranslationsInstance, 
	type SetupTranslationsConfigLoad, 
	SetupTranslations
} from '@resourge/translations'

import { wrapAuthentication } from './utils/utils'

export type SetupReactTranslationInstance<Instance> = {
	instance: Instance
	TranslationProvider: (props: PropsWithChildren) => JSX.Element
	useTranslation: () => Instance
}

export function SetupReactTranslation<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>
): SetupReactTranslationInstance<Omit<SetupTranslationsInstance<Langs, B, Trans>, 't'>>
export function SetupReactTranslation<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<B>
): SetupReactTranslationInstance<SetupTranslationsInstance<Langs, B, Trans>>
export function SetupReactTranslation<
	Langs extends string, 
	B extends BaseTranslationsType,
	Trans extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & (SetupTranslationsConfigTranslations<Langs, Trans> | SetupTranslationsConfigLoad<B>)
): SetupReactTranslationInstance<SetupTranslationsInstance<Langs, B, Trans>> {
	const Instance = SetupTranslations(config as unknown as SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, Trans>);

	const InstancePromise = wrapAuthentication(() => Instance.promise)

	const Context = createContext<{ instance: SetupTranslationsInstance<Langs, B, Trans> }>(null!);

	return {
		instance: Instance as unknown as SetupTranslationsInstance<Langs, B, Trans>,
		useTranslation() {
			const context = useContext(Context);

			if ( !context ) {
				throw new Error();
			}

			return context.instance;
		},
		TranslationProvider(props: PropsWithChildren) {
			const _instance = InstancePromise.read();
			
			const [value, setValue] = useState({
				instance: _instance
			});

			useEffect(() => {
				const missingRequestKeysRemove = Instance.addEventListener('missingRequestKeys', function () {
					setValue({
						instance: this 
					});
				})

				const languageChangeRemove = Instance.addEventListener('languageChange', function () {
					setValue({
						instance: this 
					});
				})

				return () => {
					missingRequestKeysRemove();
					languageChangeRemove();
				}
			}, [])

			return (
				<Context.Provider value={value}>
					{ props.children }
				</Context.Provider>
			)
		}
	}
}
