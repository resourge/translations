# @resourge/translations

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@resourge/translations` is a typeScript library designed to manage translations in your application. It provides a flexible setup for handling multilingual content and offers an easy-to-use interface for retrieving and managing translations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#aPI_Reference)
- [Custom Plugins](#custom_Plugins)
- [Custom Translations](#custom_Translations)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/translations
```

or NPM:

```sh
npm install @resourge/translations --save
```

## Usage

```typescript
const translationsInstance = SetupTranslations({
  langs: ['en', 'fr', 'es'],
  defaultLanguage: 'en',
  plugins: [....],
  // This
  translations: {
	greeting: {
	  en: 'Hello',
      fr: 'Bonjour',
      es: 'Hola',
	},
	goodbye: {
	  en: 'Goodbye',
      fr: 'Au revoir',
      es: 'Adiós',
	},
	homeScreen: {
	  welcome: {
	    en: 'Welcome',
	    fr: 'Bienvenue',
	    es: 'Bienvenido',
	  },
	},
  },
  // or
  load: {
    request: async () => {
      // Example: Fetch translations from a server
      const response = await fetch('/translations');
      const translations = await response.json();
      return translations;
    },
    structure: {
      greeting: 'Hello',
      goodbye: 'Goodbye',
    }
  }
});
```

### Accessing Translations
Once you have an instance, you can access translations and keys:

```typescript
const greetingTranslation = translationsInstance.T.greeting; // Access translations
const greetingTranslation2 = translationsInstance.t('greeting'); // Access translations
const greetingKey = translationsInstance.K.greeting; // Access translation keys
```

### Changing Language
You can change the current language:

```typescript
await translationsInstance.changeLanguage('en'); // Change to English

```

### Events

SetupTranslations supports events like languageChange and missingRequestKeys. 
You can listen to these events:

```typescript
translationsInstance.addEventListener('languageChange', (language: string) => {
  console.log(`Language changed to: ${language}`);
});

translationsInstance.addEventListener('missingRequestKeys', () => {
  console.log('Missing translation keys requested.');
});
```

# API Reference

## SetupTranslations
`SetupTranslations(config: SetupTranslationsConfig) => SetupTranslationsInstance`
Creates a new instance of `SetupTranslations` with the provided configuration.

## SetupTranslationsInstance

Properties

- `isReady: boolean`: Indicates if translations are ready.
- `config: SetupConfig<Langs, Trans>`: Configuration object.
- `language: string`: Current language.
- `languages: string[]`: Available languages.
- `T: Record<string, any>`: Translations object.
- `t: (key: string, values?: Record<string, any>) => string`: Function to return the translation.
- `K: Record<string, any>`: Translations keys.

Methods
- `changeLanguage(lang: string): Promise<void>`: Changes the current language.
- `addEventListener(event: EventType, callback: Function): () => void`: Adds an event listener.

# Custom Plugins

`SetupTranslations` allows you to add custom plugins for handling language changes, translation gets, translation sets and config modifications.

## Example 

```typescript
const languageChangePlugin: TranslationPlugin = {
  onLanguageChange: (language) => {
    console.log(`Language changed to: ${language}`);
  },
};

const translationGetPlugin: TranslationPlugin = {
  onTranslationGet: (keys) => {
    console.log(`Translations requested for keys: ${keys.join(', ')}`);
  },
};

const translationsInstance = SetupTranslations({
  langs: ['en', 'fr', 'es'],
  defaultLanguage: 'en',
  plugins: [languageChangePlugin, translationGetPlugin],
  // Other configuration options...
});
```
## Example for custom plugin

```typescript
const customPlugin: TranslationPlugin = {
  config: (config) => {
    return {
      ...config,
      // Add custom config modifications here
    };
  },
  onLanguageChange: (language) => {
    console.log(`Language changed to: ${language}`);
    // Add custom logic when language changes
  },
  onTranslationGet: (keys) => {
    console.log(`Translations requested for keys: ${keys.join(', ')}`);
    // Add custom logic for translation get events
  },
  onTranslationSet: (keys) => {
    console.log(`Translations set for keys: ${keys.join(', ')}`);
    // Add custom logic for translation set events
  },
};

const translationsInstance = SetupTranslations({
  langs: ['en', 'fr', 'es'],
  defaultLanguage: 'en',
  plugins: [customConfigPlugin],
  // Other configuration options...
});
```

# Custom Translations

`SetupTranslations` includes predefined custom translation functions for common scenarios such as `gender` and `plural`. These custom types provide a structured way to manage translations for gender-specific content and plural forms.

## Gender Translation function

The `gender` function handles translations for genders such as "female" and "male". It provides a convenient way to retrieve the appropriate translation based on the specified gender.

### Example:
```typescript
import { gender, SetupTranslations } from '@resourge/translations';

const translationsInstance = SetupTranslations({
  langs: ['en', 'fr'],
  defaultLanguage: 'en',
  translations: {
    trans_message: gender({
      female: {
        en: 'Female',
        fr: 'Femme',
      },
      male: {
        en: 'Male',
        fr: 'Homme',
      },
    }),
    // Add other translations as needed
  },
  // Other configuration options...
});

translationsInstance.T.trans_message({
  gender: 'male' // 'female'
})
```

## Plural Translation function
The `plural` function handles translations for plural forms. It allows you to specify translations for different counts and automatically selects the appropriate translation based on the count provided.

### Example:
```typescript
import { plural, SetupTranslations } from '@resourge/translations';

const translationsInstance = SetupTranslations({
  langs: ['en', 'fr'],
  defaultLanguage: 'en',
  translations: {
    trans_message: plural({
      one: {
        en: '1 item',
        fr: '1 article',
      },
      other: {
        en: '{count} items',
        fr: '{count} articles',
      },
      two: {
        en: '{count} items',
        fr: '{count} articles',
      },
      zero: {
        en: '{count} items',
        fr: '{count} articles',
      },
    }),
    // Add other translations as needed
  },
  // Other configuration options...
});

translationsInstance.T.trans_message({
  count: 0 // number
})
```

## Create Your Own Custom Translation function

You can create your custom translation function tailored to your application's specific needs. Here's how you can define and use your own custom translation type:

### Example

Let's say you want to create a custom translation type for greetings based on the time of day.

Define the custom translation type timeOfDayGreetings:

```typescript
import { Utils } from '@resourge/translations';

export const timeOfDayGreetings = Utils.addCustomMethods<
  'timeOfDay',
  {
    morning: string,
    afternoon: string,
    evening: string,
    night: string,
  }
>(
  'timeOfDay',
  (value, params) => {
    const time = params.timeOfDay;
    return value[time];
  }
);
```

Usage example:

```typescript
const translationsInstance = SetupTranslations({
  langs: ['en', 'fr'],
  defaultLanguage: 'en',
  translations: {
    trans_message: timeOfDayGreetings({
      morning: {
        en: 'Good morning!',
        fr: 'Bonjour!',
      },
      afternoon: {
        en: 'Good afternoon!',
        fr: 'Bon après-midi!',
      },
      evening: {
        en: 'Good evening!',
        fr: 'Bonsoir!',
      },
      night: {
        en: 'Good night!',
        fr: 'Bonne nuit!',
      },
    }),
    // Add other translations as needed
  },
  // Other configuration options...
});

translationsInstance.T.trans_message({
	timeOfDay: 'morning' // afternoon || evening || night
})
```
## Documentation

For comprehensive documentation and usage examples, visit the [Translation documentation](https://resourge.vercel.app/docs/translations/intro).

### Integration with Other Frameworks

`@resourge/translations` can be integrated with popular frameworks.

For React and Vue:

- [React translation documentation](https://resourge.vercel.app/docs/translations/intro-react)
- [Vue translation documentation](https://resourge.vercel.app/docs/translations/intro-vue)

## Contributing

Contributions to `@resourge/translations` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

Fetch is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)