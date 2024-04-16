# @resourge/react-translations

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@resourge/react-translations` is designed to simplify the integration of translations into React applications. It provides a straightforward way to set up and use translations using the [`@resourge/translations`](../translations/README.md) library within React components.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [useTranslation](#useTranslation)
- [TranslationProvider](#translationProvider)
- [Trans component](#trans-component)
- [Vite integration](#vitetranslationplugin)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/react-translations
```

or NPM:

```sh
npm install @resourge/react-translations --save
```

## Usage

```tsx
import { TranslationProvider, SetupReactTranslations } from '@resourge/react-translations';

const { TranslationInstance, useTranslation } = SetupReactTranslations({
  langs: ['en', 'fr', 'es'],
  defaultLanguage: 'en',
  plugins: [....],
  // This
  translations: {
	// .....
	greeting: {
	  en: 'Hello',
      fr: 'Bonjour',
      es: 'Hola',
	},
  },
  // or
  load: {
    // ....
  }
});

function Component() {
  const { T } = useTranslation();

  return (
    <p>{ T.greeting }</p>
  )
}

function App() {
  return (
    <TranslationProvider TranslationInstance={TranslationInstance}>
      <Component />
    </TranslationProvider>
  )
}
```

# API Reference

## SetupReactTranslations

The `SetupReactTranslations` function takes in a configuration object and returns an object with the following properties:

- `TranslationInstance`: The instance of the translation setup, which includes access to the translations [For more documentation](../translations/README.md#setuptranslations).
- `useTranslation`: A hook to be used in React components to access the translations. It must be used within a component wrapped with TranslationProvider.


# useTranslation

`useTranslation` hook allows you to access the translation functions and objects provided by the translation setup, typically created with `SetupReactTranslations`. 

`useTranslation` provides several useful returns:
- `T`: Translations object for the current language.
- `changeLanguage`: Function to change the current language.
- `languages`: Array of available language codes.
- `language`: Current language code.
- `addEventListener`: Function to add event listeners for language change or missing translations.

1. `T` (Translations Object)
	- This is an object containing the translations for the current language.
	- You can access specific translation values using keys.
	- For example, if you have a translation for "greeting", you can access it as T.greeting.

```typescript
const { T } = useTranslation();
console.log(T.greeting); // Outputs the translation for "greeting" in the current language
```

2. `changeLanguage` (Function)
	- This function allows you to change the current language dynamically.
	- When called, it updates the translations used in the component.
```typescript
const { changeLanguage } = useTranslation();
changeLanguage('fr'); // Changes the language to French
```

3. `languages` (Array of Strings)
	- An array containing all available language codes.
	- Useful for creating language selection UIs or other dynamic language-related functionality.
```typescript
const { languages } = useTranslation();
console.log(languages); // Outputs ['en', 'fr', ...] based on your setup
```

4. `language` (String)
	- The current language code being used.
	- It reflects the language the translations are currently in.
```typescript
const { language } = useTranslation();
console.log(language); // Outputs the current language code ('en', 'fr', etc.)
```

5. `addEventListener` (Function)
	- Allows you to add an event listener for language change or missing translations.
	- Pass in the event type ('languageChange' or 'missingRequestKeys') and a callback function.
	- Returns a function to remove the added event listener when needed.

```typescript
const { addEventListener } = useTranslation();

const handleLanguageChange = (lang) => {
  console.log(`Language changed to: ${lang}`);
};

const languageChangeListener = addEventListener('languageChange', handleLanguageChange);

// Later, when done:
// languageChangeListener(); // Removes the event listener
```

#### Example

Here's an example of how you might use these returns in a React component:

```jsx
import React from 'react';
import { useTranslation } from 'path/to/setupReactTranslations/file.ts';

const LanguageSelector = () => {
  const { languages, language, changeLanguage } = useTranslation();

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  return (
    <div>
      <h4>Select Language:</h4>
      <ul>
        {languages.map((lang) => (
          <li key={lang}>
            <button onClick={() => handleLanguageChange(lang)}>
              {lang.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>
      <p>Current Language: {language.toUpperCase()}</p>
    </div>
  );
};

export default LanguageSelector;
```

# TranslationProvider

`TranslationProvider` component serves as a bridge between your translation setup and React components, enabling seamless integration of translations and dynamic language changes throughout your application. It is used in conjunction with the `SetupReactTranslations` setup to manage language changes and missing translation requests.

## Props

- `children`: ReactNode - The children components to be wrapped by the TranslationProvider.
- `TranslationInstance`: `SetupReactTranslationInstance<any, any>` - The translation instance obtained from SetupReactTranslations.
- `components`: Partial<ComponentsContextType> - Optional. Custom components to be used in translations.

# Trans component

The `Trans` component is designed to handle dynamic translations with support for custom components. It parses HTML-like strings into React elements, replacing tags with corresponding React components or fallback elements.

## Usage

```tsx
import { Trans, useTranslations } from '@resourge/react-translations';
/*
Assuming

translations: {
  en: {
    greeting: 'Hello, <strong>{name}</strong>!',
    button: '<button>Click me</button>'
  },
  fr: {
    greeting: 'Bonjour, <strong>{name}</strong>!',
    button: '<button>Cliquez</button>'
  }
}
*/

function GreetingComponent({ name }) {
  const { T } = useTranslations();
  return (
    <Trans message={T.greetings} components={{ strong: <strong /> }} />
  );
}
```

## Props

- `message`: string - The translation message to be rendered.
- `components`: readonly ReactElement[] | Readonly<Record<string, ReactElement>> - Optional. Custom components to be used in the translation. These components will replace the corresponding tags in the translation message.

### Additional Notes

- The `Trans` component parses an HTML-like string and replaces tags with React components or fallback elements.
- It accepts a message prop containing the translation.
- The `components` prop allows you to pass custom components to be used in the translation. These components should correspond to the tags used in the translation message.
- If a tag in the translation message does not have a corresponding component in the components prop (or in the `TranslationsProvider` `components` prop), it will render a `missing-translation-tag` element with the tag name.

# Custom Plugins and Custom translations functions

`@resourge/react-translations` is a complement of `@resourge/translations` so all documentation is also valid in this package. [See More](../translations/README.md)

# viteTranslationPlugin

`viteTranslationPlugin`, is designed to enhance Vite applications by optimizing translation loading for production. It provides seamless integration for custom translations and ensures efficient handling of translation files. [More documentation](../viteTranslationPlugin/README.md)

## Documentation

For comprehensive documentation and usage examples, visit the [React documentation](https://resourge.vercel.app/docs/translations/intro-react).

### Integration with Other Frameworks

For Javascript and Vue:

- [Javascript translation documentation](https://resourge.vercel.app/docs/translations/intro)
- [Vue translation documentation](https://resourge.vercel.app/docs/translations/intro-vue)

## Contributing

Contributions to `@resourge/react-translations` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

`@resourge/react-translations` is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)