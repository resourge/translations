import {
	SetupTranslations,
	gender,
	languageLocalStorage,
	navigatorLanguageDetector,
	plural
} from './lib'

// TODO ADD FULL KEYS

const TRANSLATION = SetupTranslations({
	langs: ['en', 'pt', 'gb'],
	defaultLanguage: 'en',
	/* load: {
		request: (language: string, lastRequest: Date) => {
			console.log('---------->language', language)
			console.log('---------->lastRequest', lastRequest)
			return Promise.resolve({
				hello: `${language} Hello`,
				'hello2.test': `${language} Hello Test`,
				test1: `${language} Test {{value}}`
			})
		},
		structure: {
			hello: 'Hello',
			hello2: {
				test: 'Hello'
			},
			test1: 'Test {{value}}'
		}
	} */
	translations: {
		hello: {
			en: 'Hello',
			pt: 'Ola',
			gb: 'Bonjour'
		},
		hello2: {
			test: {
				en: 'Hello',
				pt: 'Ola',
				gb: 'Bonjour'
			}
		},
		test1: {
			en: 'Test {{value}}',
			pt: 'Teste {{value}}',
			gb: 'Tet {{value}}'
		},
		test2: plural({
			one: {
				en: 'One',
				pt: 'Um',
				gb: 'Un'
			},
			other: {
				en: 'Other',
				pt: 'Outro',
				gb: 'OTro'
			}
		}),
		test3: gender({
			female: {
				en: 'female {{value: number}}',
				pt: 'mulher {{value: number}}',
				gb: 'mul {{value: number}}'
			},
			male: {
				en: 'male {{value: number}}',
				pt: 'homem {{value: number}}',
				gb: 'hom {{value: number}}'
			}
		})
	}
})

// TRANSLATION.T

// TRANSLATION.t('')

const test: string = 'test'

type A<K> = K extends string ? 'STRING' : 'NOT';
type B<K> = string extends K ? 'STRING' : 'NOT';

type A1 = A<string>
type A2 = A<'ntest'>

type B1 = B<string>
type B2 = B<'ntest'>

console.log('TRANSLATION', TRANSLATION)
console.log('TRANSLATION.t()', TRANSLATION.t(test))
console.log('TRANSLATION.t()', TRANSLATION.t('test3', {
	gender: 'female',
	value: 10
}))

/* const test = TRANSLATION.t('', {
	value: 'test'
}) */

function App() {
	return (<></>)
}
export default App;
