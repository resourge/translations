<script lang="ts" setup>
import { BaseTranslationsType, TranslationsType } from '@resourge/translations';
import { onMounted, onUnmounted, provide, reactive, toRefs } from 'vue'
import { SetupVueTranslationInstance } from '../../SetupVueTranslations.js';

export type TranslationProviderProps = {
    TranslationInstance: SetupVueTranslationInstance<
		any, 
		any
	> | any
}

const props = defineProps<TranslationProviderProps>()

await props.TranslationInstance.promise;

const state = reactive({
	languages: props.TranslationInstance.languages,
	language: props.TranslationInstance.language,
	T: props.TranslationInstance.T,
})

let missingRequestKeysRemove = () => {}

let languageChangeRemove = () => {}

const updateState = () => {
	state.languages = props.TranslationInstance.languages;
	state.language = props.TranslationInstance.language;
	state.T = props.TranslationInstance.T;
}

onMounted(() => {
	missingRequestKeysRemove = props.TranslationInstance.addEventListener('missingRequestKeys', updateState)
	languageChangeRemove = props.TranslationInstance.addEventListener('languageChange', updateState)
})

onUnmounted(() => {
	missingRequestKeysRemove()
	languageChangeRemove()
})

provide(
	props.TranslationInstance.TranslationsSymbol, 
	toRefs(
		state
	)
);
</script>

<template>
	<slot />
</template>
