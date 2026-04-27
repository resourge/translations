import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

import { defineLibConfig, getWorkspaces } from '../../config/defineLibConfig';

import { name } from './package.json';

const workspaces = getWorkspaces()
.filter((workspace) => {
	return !workspace.endsWith(name);
})
.map((workspace) => path.join(workspace, 'dist'));

// https://vitejs.dev/config/
export default defineLibConfig(
	{
		plugins: [react()]
	},
	(oldFile: string) => {
		workspaces.forEach((workspace) => {
			if ( !fs.existsSync(workspace) ) {
				fs.mkdirSync(workspace);
			}
			const _oldFile = path.join(__dirname, 'dist', oldFile);
			const newFile = oldFile.replace('index', name);
			fs.copyFileSync(_oldFile, path.join(workspace, newFile));
		});
	}
);
