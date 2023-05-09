<script lang="ts" setup>
import { BaseTranslationsType, TranslationsType } from '@resourge/translations';
import { onMounted, onUnmounted, provide, reactive, readonly, toRefs } from 'vue'
import { SetupVueTranslationInstance } from '../../SetupVueTranslations.js';

export type TranslationProviderProps = {
    TranslationInstance: SetupVueTranslationInstance<string, TranslationsType<string> | BaseTranslationsType>
}

const props = defineProps<TranslationProviderProps>()

await props.TranslationInstance.promise;

const { instance } = toRefs(reactive({
    instance: props.TranslationInstance
}))

let missingRequestKeysRemove = () => {}

let languageChangeRemove = () => {}

onMounted(() => {
    missingRequestKeysRemove = props.TranslationInstance.addEventListener('missingRequestKeys', function () {
        instance.value = props.TranslationInstance
    })
    languageChangeRemove = props.TranslationInstance.addEventListener('languageChange', function () {
    	instance.value = props.TranslationInstance
    })
})

onUnmounted(() => {
    missingRequestKeysRemove()
    languageChangeRemove()
})

provide(props.TranslationInstance.TranslationsSymbol, readonly({ instance }));
</script>

<template>
	<slot />
</template>
