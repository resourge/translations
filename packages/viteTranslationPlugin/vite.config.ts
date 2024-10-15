import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import { join } from 'path'

import { defineLibConfig, getWorkspaces } from '../../config/defineLibConfig'

import { name } from './package.json'

const workspaces = getWorkspaces()
.filter((workspace) => {
	return !workspace.endsWith(name);
})
.map(workspace => join(workspace, 'dist'));

// https://vitejs.dev/config/
export default defineLibConfig(
	{
		plugins: [react()]
	},
	(oldFile: string) => {
		workspaces.forEach((workspace) => {
			if ( !fs.existsSync(workspace) ) {
				fs.mkdirSync(workspace)
			}
			const _oldFile = join(__dirname, 'dist', oldFile)
			const newFile = oldFile.replace('index', name)
			fs.copyFileSync(_oldFile, join(workspace, newFile));
		})
	}
)
