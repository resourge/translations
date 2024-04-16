# viteTranslationPlugin

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`viteTranslationPlugin`, is designed to enhance Vite applications by optimizing translation loading for production. It provides seamless integration for custom translations and ensures efficient handling of translation files.

## Table of Contents

- [Usage](#usage)
- [Production-Optimized Translations](#production-optimized-translations)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Usage

To use the `viteTranslationPlugin`, add it to your Vite configuration file (`vite.config.ts`):

```typescript
import { viteTranslationPlugin } from '@resourge/translations';

export default {
  plugins: [
    viteTranslationPlugin()
  ]
};
```
# Production Optimized Translations

When you build your Vite application for production (`npm run build` or `yarn build`), the `viteTranslationPlugin` will automatically split translations into separate files for each language. This ensures that the translations will only be loaded when needed, optimizing performance and reducing load times.

## Contributing

Contributions to `@resourge/translations` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

Fetch is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)