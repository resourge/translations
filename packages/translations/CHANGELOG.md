# [@resourge/translations-v1.9.9](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.8...@resourge/translations-v1.9.9) (2023-12-04)


### Bug Fixes

* **translationtypes:** fix TranslationsType not working as intended with plugins ([277ea9a](https://github.com/resourge/translations/commit/277ea9a6c40fdaeaf8a13229ca836ad225f3425d))

# [@resourge/translations-v1.9.8](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.7...@resourge/translations-v1.9.8) (2023-11-10)


### Performance Improvements

* **translationstypes:** remove and improve some types causing performance in visual studio code ([530f137](https://github.com/resourge/translations/commit/530f137e6f65d7a3dc93b9b26ec3e004a8505ae8))

# [@resourge/translations-v1.9.7](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.6...@resourge/translations-v1.9.7) (2023-10-26)


### Bug Fixes

* **vitetranslationsplugin:** fix build translations when language had hyphen ([736217d](https://github.com/resourge/translations/commit/736217d0882aee28b4e0377fc7c9a79a16f39195))

# [@resourge/translations-v1.9.6](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.5...@resourge/translations-v1.9.6) (2023-10-12)


### Bug Fixes

* **setuptranslation:** fix onLanguageChange triggering before fetching new translations ([363b8ff](https://github.com/resourge/translations/commit/363b8ff09366a18a2ea2e71e53027a82801f07df))

# [@resourge/translations-v1.9.5](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.4...@resourge/translations-v1.9.5) (2023-09-27)


### Bug Fixes

* **maptranslations:** fix t not returning key when it fails to find the value ([338f13f](https://github.com/resourge/translations/commit/338f13f0274ee29e6b25bdb0ed55f59e0efa3751))

# [@resourge/translations-v1.9.4](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.3...@resourge/translations-v1.9.4) (2023-09-14)


### Bug Fixes

* **translations:** fix plural not working in production ([8e102e8](https://github.com/resourge/translations/commit/8e102e8d18a24ff399ee5093dc2b9080428cbba4))

# [@resourge/translations-v1.9.3](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.2...@resourge/translations-v1.9.3) (2023-09-14)


### Bug Fixes

* **vitetranslationplugin:** not working for plural ([a67663f](https://github.com/resourge/translations/commit/a67663fa518bfc8a037a0a6fa8c0a54ff797b42f))

# [@resourge/translations-v1.9.2](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.1...@resourge/translations-v1.9.2) (2023-08-10)


### Bug Fixes

* **vitetranslationplugin:** not working when tsconfig baseUrl is not the root of the project ([ec3e82e](https://github.com/resourge/translations/commit/ec3e82e737328819014f80d548061e5fc73ceaa1))

# [@resourge/translations-v1.9.1](https://github.com/resourge/translations/compare/@resourge/translations-v1.9.0...@resourge/translations-v1.9.1) (2023-08-08)


### Bug Fixes

* **translationtypes:** remove Narrow and replace it with AsConst to better match types ([8c3f36f](https://github.com/resourge/translations/commit/8c3f36f2f8c62d6edbfdd780ec98b9ce2a0a2bea))
* **vitetranslationplugin:** fix type ([c17c439](https://github.com/resourge/translations/commit/c17c43993a183ac5191b63657ae803c621f0704b))

# [@resourge/translations-v1.9.0](https://github.com/resourge/translations/compare/@resourge/translations-v1.8.2...@resourge/translations-v1.9.0) (2023-08-07)


### Bug Fixes

* **utils:** replaceParams not working in strings with more than 1 param ([192e7be](https://github.com/resourge/translations/commit/192e7bed2657116b754201d346e62e98011c6b9e))


### Features

* **htmllanguage:** add htmllanguage to automatically update html lang attribute ([5c264f9](https://github.com/resourge/translations/commit/5c264f9f3f18cc954a47e5b1664594f959c574de))

# [@resourge/translations-v1.8.2](https://github.com/resourge/translations/compare/@resourge/translations-v1.8.1...@resourge/translations-v1.8.2) (2023-07-19)


### Bug Fixes

* **vitetranslationplugin:** fix bug where paths were not correctly set ([bcdd27e](https://github.com/resourge/translations/commit/bcdd27e27f95ea296bf20da0bed55cff3e9873ef))

# [@resourge/translations-v1.8.1](https://github.com/resourge/translations/compare/@resourge/translations-v1.8.0...@resourge/translations-v1.8.1) (2023-05-17)


### Bug Fixes

* **setuptranslation:** in case language doesn't match, fail changeLanguage ([93865e2](https://github.com/resourge/translations/commit/93865e2efbd1bbf112b94aa5873758fa5f6cb347))

# [@resourge/translations-v1.8.0](https://github.com/resourge/translations/compare/@resourge/translations-v1.7.4...@resourge/translations-v1.8.0) (2023-05-09)


### Features

* **setuptranslations:** defaults to first langs in case defaultLanguage is not set ([d2adc97](https://github.com/resourge/translations/commit/d2adc97e1b69be3f33291cf7573540daa0d7deb2))

# [@resourge/translations-v1.7.4](https://github.com/resourge/translations/compare/@resourge/translations-v1.7.3...@resourge/translations-v1.7.4) (2023-05-09)


### Bug Fixes

* **t:** fix t type ([7653ca5](https://github.com/resourge/translations/commit/7653ca5a9f796acf0fe30a46c6cbd402e9103b09))

# [@resourge/translations-v1.7.3](https://github.com/resourge/translations/compare/@resourge/translations-v1.7.2...@resourge/translations-v1.7.3) (2023-05-09)


### Bug Fixes

* **utils:** export utils to fix bug with viteTranslationPlugin ([7d0b8b7](https://github.com/resourge/translations/commit/7d0b8b72dc687775532c76996d3dadf5bd6833ab))

# [@resourge/translations-v1.7.2](https://github.com/resourge/translations/compare/@resourge/translations-v1.7.1...@resourge/translations-v1.7.2) (2023-05-09)


### Bug Fixes

* **keystructure:** fix keystructure not working as expected ([10a07d5](https://github.com/resourge/translations/commit/10a07d52f9834679bdf9ede1fe633eb8d33e50c5))

# [@resourge/translations-v1.7.1](https://github.com/resourge/translations/compare/@resourge/translations-v1.7.0...@resourge/translations-v1.7.1) (2023-05-09)


### Bug Fixes

* **setuptranslations:** fix keyStructure not working as intended ([26c0065](https://github.com/resourge/translations/commit/26c00656ef6c47398a09f9dcfb9cc30e92201d5b))

# [@resourge/translations-v1.7.0](https://github.com/resourge/translations/compare/@resourge/translations-v1.6.0...@resourge/translations-v1.7.0) (2023-05-08)


### Bug Fixes

* **maptranslations and trans:** fix not returning key when value doesnt exist ([e0078f6](https://github.com/resourge/translations/commit/e0078f697ad2227a73063c79d917d86d41f92c8e))
* **translations:** fix type not work as expected ([6d2a0d6](https://github.com/resourge/translations/commit/6d2a0d682a5acde9ce7ab85d843a2885cfaa3847))


### Features

* **trans:** add Trans component to include html elements ([e42bab3](https://github.com/resourge/translations/commit/e42bab38fb1f4a4f781e6c3187b09137c065966d))

# [@resourge/translations-v1.6.0](https://github.com/resourge/translations/compare/@resourge/translations-v1.5.0...@resourge/translations-v1.6.0) (2023-05-08)


### Bug Fixes

* **translationtypes:** fix forcing custom values types to be string ([9551eba](https://github.com/resourge/translations/commit/9551ebaf5a54126a06d94987bfbd77c248a9fe39))
* **types:** fix translation types ([843e576](https://github.com/resourge/translations/commit/843e57620f3464d97463f46f4d0cba0d4041985b))


### Features

* **setuptranslation:** add t for translation instances ([ac5bc60](https://github.com/resourge/translations/commit/ac5bc60d53da06524f72c4b30872b5911bc9966f))
* **translations:** add key structure as an element of the translation instance ([f60a516](https://github.com/resourge/translations/commit/f60a51612b760b85c963580be9ed002139c08382))

# [@resourge/translations-v1.5.0](https://github.com/resourge/translations/compare/@resourge/translations-v1.4.0...@resourge/translations-v1.5.0) (2023-05-04)


### Features

* **project:** new version ([055ed68](https://github.com/resourge/translations/commit/055ed681c1fc173e8b9d18c9dd85033811583668))

# [@resourge/translations-v1.1.0](https://github.com/resourge/translations/compare/@resourge/translations-v1.0.2...@resourge/translations-v1.1.0) (2023-05-04)


### Features

* **project:** force new and same version ([b2ca080](https://github.com/resourge/translations/commit/b2ca08070e16ce73d03385c21fc9ae3eef15e1eb))

# [@resourge/translations-v1.0.2](https://github.com/resourge/translations/compare/@resourge/translations-v1.0.1...@resourge/translations-v1.0.2) (2023-05-04)


### Bug Fixes

* **package json:** fix command line build ([1988ad3](https://github.com/resourge/translations/commit/1988ad3a67baa7e363afac161417fd8e1a0521d9))

# [@resourge/translations-v1.0.1](https://github.com/resourge/translations/compare/@resourge/translations-v1.0.0...@resourge/translations-v1.0.1) (2023-05-04)


### Bug Fixes

* **package:** for a new version ([9b41da4](https://github.com/resourge/translations/commit/9b41da4de2999a03a23ba1480232c45775227c89))

# @resourge/translations-v1.0.0 (2023-05-04)


### Features

* **project:** first Commit ([39cd542](https://github.com/resourge/translations/commit/39cd542cb9b481958b4e0cccabb624871eedc268))

# 1.0.0 (2023-05-04)


### Features

* **project:** first Commit ([39cd542](https://github.com/resourge/translations/commit/39cd542cb9b481958b4e0cccabb624871eedc268))
