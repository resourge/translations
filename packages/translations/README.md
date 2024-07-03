# @resourge/translations

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@resourge/translations` is a typeScript library designed to manage translations in your application. It provides a flexible setup for handling multilingual content and offers an easy-to-use interface for retrieving and managing translations.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Plugins](#plugins)
- [Custom Translations](#custom-translations)
- [Vite integration](#vitetranslationplugin)
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

# Plugins

`SetupTranslations` allows you to add plugins or custom plugins for handling language changes, translation gets, translation sets and config modifications.

## htmlLanguage

`htmlLanguage` plugin is a simple plugin designed to handle setting the HTML `lang` attribute based on the current language. It ensures that the `lang` attribute of the HTML element reflects the selected language, providing accessibility benefits and aiding in language-specific styling.

`htmlLanguage` plugin will automatically:

- Set the `lang` attribute of the `<html>` element to the selected language.
- Update the `lang` attribute whenever the language changes.

### Usage

```typescript
import { htmlLanguage } from '@resourge/translations';

const translationsConfig = SetupTranslations({
  langs: ['en', 'fr'],
  defaultLanguage: 'en',
  translations: {
    en: {
      greeting: 'Hello!'
    },
    fr: {
      greeting: 'Bonjour!'
    }
  },
  plugins: [htmlLanguage()]
});
```

#### Additional Notes

- Make sure the `htmlLanguage` plugin is added to your translation setup using `SetupTranslations`.
- The `lang` attribute of the HTML element is essential for screen readers and other accessibility tools.
- The plugin provides a convenient way to ensure the correct language is reflected in the HTML for improved accessibility and language-specific styling.

## languageLocalStorage

`languageLocalStorage` plugin is designed to store and retrieve translations in the browser's local storage. This allows for persistent language selection across sessions, enhancing the user experience by remembering the chosen language.

`languageLocalStorage` plugin will automatically:

- Retrieve the selected language from local storage and set it as the default language.
- Store translations in local storage when they are set.
- Retrieve translations from local storage if available, falling back to the provided translations.

### Usage

```typescript
import { languageLocalStorage } from '@resourge/translations';

const translationsConfig = SetupTranslations({
  langs: ['en', 'fr'],
  defaultLanguage: 'en',
  translations: {
    en: {
      greeting: 'Hello!'
    },
    fr: {
      greeting: 'Bonjour!'
    }
  },
  plugins: [languageLocalStorage()]
});
```

#### Additional Notes

- The `languageLocalStorage` plugin provides a way to store translations in the browser's local storage.
- It ensures that the selected language is persisted across sessions, improving user experience.
- Make sure the `languageLocalStorage` plugin is added to your translation setup using `SetupTranslations`.

## navigatorLanguageDetector

`navigatorLanguageDetector` plugin is designed to detect the user's preferred language based on their browser settings. It utilizes the `navigator` object to retrieve the language information.

`navigatorLanguageDetector` plugin will automatically:

- Detect the user's preferred language based on their browser settings.
- Apply the detected language if it matches any of the configured languages.
- Fall back to the default language if the detected language is not supported.

### Usage

```typescript
import { navigatorLanguageDetector } from '@resourge/translations';

const translationsConfig = SetupTranslations({
  langs: ['en', 'fr'],
  defaultLanguage: 'en',
  translations: {
    en: {
      greeting: 'Hello!'
    },
    fr: {
      greeting: 'Bonjour!'
    }
  },
  plugins: [navigatorLanguageDetector()]
});
```

#### Additional Notes

- The `navigatorLanguageDetector` plugin automatically detects the user's preferred language based on their browser settings.
- It allows for custom modification of the detected language before applying it to the translation setup.
- Ensure that the `navigatorLanguageDetector` plugin is added to your translation setup using `SetupTranslations`.

## Custom Plugins

`navigatorLanguageDetector`, `htmlLanguage`, `languageLocalStorage` plugins are just examples of a translation plugin. You can create your own custom plugins to extend the functionality of your translation setup. 

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
import { CustomMethods } from '@resourge/translations';

export const timeOfDayGreetings = CustomMethods.add<
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

# viteTranslationPlugin

`viteTranslationPlugin`, is designed to enhance Vite applications by optimizing translation loading for production. It provides seamless integration for custom translations and ensures efficient handling of translation files. [More documentation](../viteTranslationPlugin/README.md)

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

`@resourge/translations` is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)