import { exec, execSync } from 'child_process';
import path from 'path';
import { shellEscape } from 'ps-std';

import ask from './ask';
import run from './run';
import selector from './selector';

export async function commit_file(file: string) {
	const repo_root = String(execSync('git rev-parse --show-toplevel')).trim();
	const options = { cwd: repo_root };
	const filestr = file === '.' ? '' : `(${file})`;
	const type =
		(await selector(`Commit type ${filestr}`.trim(), {
			'': 'custom',
			feat: 'feat',
			fix: 'fix',
			refactor: 'refactor',
			revert: 'revert',
			build: 'build',
			chore: 'chore',
			ci: 'ci',
			docs: 'docs',
			perf: 'perf',
			style: 'style',
			test: 'test',
		})) || (await ask('Custom commit type'));
	const msg = await ask('What did you modify?');
	if (type && msg) {
		const full = `${type}${filestr}: ${msg}`;
		await run(`git add ${shellEscape(file)}`, options);
		await run(`git commit -m ${shellEscape(full)}`, options);
		return true;
	}
}

export async function ask_about_file(file: string) {
	const ans = await selector(`Commit ${file}?`, {
		[0]: 'do not commit',
		[1]: 'commit',
		[2]: 'commit parent directory',
	});
	if (!ans) {
		return;
	} else if (+ans === 1) {
		await commit_file(file);
	} else if (+ans === 2) {
		await ask_about_file(path.join(file, '..'));
	}
}

export async function go_through_files(...files: string[]) {
	const commit_f = files.length ? commit_file : ask_about_file;

	if (!files.length) {
		return exec('git diff --name-only', async (error, stdout, stderr) => {
			const files = stdout
				.toString()
				.split(/[\r\n]+/g)
				.map((file) => {
					file = file.replace(/\/$/g, '');
					file = file.replace(/\/mod\.rs$/g, '');
					file = file.replace(/\/index\.[tj]s$/g, '');
					file = file.replace(/(\/|^)src$/g, '');
					file = file.replace(
						/^(.+)(\/?[^\/]*)(\/?[^\/]*).*$/,
						'$1$2$3'
					);

					return file;
				})
				.filter((a) => a);

			const final = files.length ? files : '.';

			if (final.length > 1) {
				for (const file of final) {
					await ask_about_file(file);
				}
			} else {
				await go_through_files(...final);
			}
		});
	}

	for (const file of files) {
		if (file) {
			await commit_f(file).catch(console.error);
		}
	}
}

process
	.on('unhandledRejection', console.error)
	.on('uncaughtException', console.error);
