import vue from '@vitejs/plugin-vue'

import { defineLibConfig } from '../../config/defineLibConfig';

// https://vitejs.dev/config/
export default defineLibConfig({
	plugins: [vue()]
})
