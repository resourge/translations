/*  
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useState
} from 'react'

import { SetupTranslations, type SetupTranslationsInstance } from './lib/SetupTranslationsInstance'
import { gender } from './lib/custom/gender'
import { plural } from './lib/custom/plural'
import { languageLocalStorage } from './lib/plugins/languageLocalStorage'
import { navigatorLanguageDetector } from './lib/plugins/navigatorLanguageDetector'
import { type BaseTranslationsType, type TranslationsType } from './lib/types/TranslationTypes'
import { type SetupTranslationsConfig, type SetupTranslationsConfigLoad, type SetupTranslationsConfigTranslations } from './lib/types/configTypes'
import { wrapAuthentication } from './utils'

type SetupReactTranslationInstance<
	Instance
> = {
	instance: Instance
	TranslationProvider: (props: PropsWithChildren) => JSX.Element
	useTranslation: () => Instance
}

export function SetupReactTranslation<
	Langs extends string, 
	B extends BaseTranslationsType,
	T extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigTranslations<Langs, T>
): SetupReactTranslationInstance<Omit<SetupTranslationsInstance<Langs, B, T>, 't'>>
export function SetupReactTranslation<
	Langs extends string, 
	B extends BaseTranslationsType,
	T extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & SetupTranslationsConfigLoad<B>
): SetupReactTranslationInstance<SetupTranslationsInstance<Langs, B, T>>
export function SetupReactTranslation<
	Langs extends string, 
	B extends BaseTranslationsType,
	T extends TranslationsType<Langs> | undefined = undefined
>(
	config: SetupTranslationsConfig<Langs> & (SetupTranslationsConfigTranslations<Langs, T> | SetupTranslationsConfigLoad<B>)
): SetupReactTranslationInstance<SetupTranslationsInstance<Langs, B, T>> {
	const Instance = SetupTranslations(config as any);

	const InstancePromise = wrapAuthentication(() => Instance.promise)

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const Context = createContext<{ instance: SetupTranslationsInstance<Langs, B, T> }>(null!);

	return {
		instance: Instance as unknown as SetupTranslationsInstance<Langs, B, T>,
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

const { TranslationProvider, useTranslation } = SetupReactTranslation({
	langs: ['en', 'pt', 'fr'],
	defaultLanguage: 'en',
	plugins: [
		navigatorLanguageDetector({
			onLanguage: (language) => language.split('-')[0]
		}),
		languageLocalStorage()
	],
	/* load: {
		request: (language: string, lastRequest: Date) => {
			console.log("---------->language", language)
			console.log("---------->lastRequest", lastRequest)
			return Promise.resolve({
				hello: `${language} Hello`,hello2.test': `${language} Hello Test`,test1':`${language} Test {{value}}`
			})
		},
		structure: {
			hello: 'Hello',
			hello2: {
				test: 'Hello'
			},
			test1: 'Test {{value}}'
		}
	} 
	translations: {
		hello: {
			en: 'Hello',
			pt: 'Ola',
			fr: 'Bonjour'
		},
		hello2: {
			test: {
				en: 'Hello',
				pt: 'Ola',
				fr: 'Bonjour'
			}
		},
		test1: {
			en: 'Test {{value}}',
			pt: 'Teste {{value}}',
			fr: 'Tet {{value}}'
		},
		test2: plural({
			one: {
				en: 'One',
				pt: 'Um',
				fr: 'Un'
			},
			other: {
				en: 'Other',
				pt: 'Outro',
				fr: 'OTro'
			}
		}),
		test3: gender({
			female: {
				en: 'female {{value}}',
				pt: 'mulher {{value}}',
				fr: 'mul {{value}}'
			},
			male: {
				en: 'male {{value}}',
				pt: 'homem {{value}}',
				fr: 'hom {{value}}'
			}
		})
	}
})

function Test() {
	const {
		T, language, languages, changeLanguage
	} = useTranslation();

	return (
		<div>
			<table>
				<tr>
					<td colSpan={2}>
						Language: 
						{' '}
						{ language }
					</td>
				</tr>
				<tr>
					<td>
						Key: hello
					</td>
					<td>
						Value: 
						{' '}
						{ T.hello }
					</td>
				</tr>
				<tr>
					<td>
						Key: hello2
					</td>
					<td>
						Value:
					</td>
				</tr>
				<tr>
					<td>
						Key: hello2.test
					</td>
					<td>
						Value:
						{T.hello2.test}
					</td>
				</tr>
				<tr>
					<td>
						Key: hello2.test
					</td>
					<td>
						Value:
						{T.test1({
							value: 'José'
						})}
					</td>
				</tr>
				<tr>
					<td>
						Key: test2
					</td>
					<td>
						Value:
						{T.test2({
							count: 0 
						})}
						
					</td>
				</tr>
				<tr>
					<td>
						Key: test2
					</td>
					<td>
						Value:
						{
							T.test2({
								count: 1 
							})
						}
					</td>
				</tr>
				<tr>
					<td>
						Key: test2
					</td>
					<td>
						Value:
						{
							T.test2({
								count: 2 
							})
						}
					</td>
				</tr>
				<tr>
					<td>
						Key: test2
					</td>
					<td>
						Value:
						{T.test3({
							gender: 'female',
							value: 'DID IT WORK?' 
						})}
						
					</td>
				</tr>
				<tr>
					<td>
						Key: test2
					</td>
					<td>
						Value:
						{T.test3({
							gender: 'male',
							value: 'DID IT WORK?' 
						})}
						
					</td>
				</tr>
			</table>
			<div>
				{
					languages.map((lang) => (
						<button key={lang} onClick={() => changeLanguage(lang)}>
							{ lang }
						</button>
					))
				}
			</div>
		</div>
	)
}

function App() {
	return (
		<TranslationProvider>
			<Test />
		</TranslationProvider>
	)
}

export default App */

function App() {
	return (<></>)
}
export default App;
