import { exec } from 'child_process';
import ask from './ask';
import run from './run';
import selector from './selector';

export async function commit_file(file: string) {
	const msg = await ask('What did you modify?');
	if (msg) {
		const full = `${file}: ${msg}`;
		await run(`git add ${file}`);
		await run(`git commit -m ${JSON.stringify(full)}`);
		return true;
	}
}

export async function ask_about_file(file: string) {
	const ans = await selector(`Commit ${file}?`, {
		[0]: 'do not commit',
		[1]: 'commit',
	});
	if (ans && +ans) {
		await commit_file(file);
	}
}

export async function go_through_files(...files: string[]) {
	if (!files.length) {
		files = (
			await new Promise<string>((resolve) =>
				exec('git diff --name-only', (error, stdout, stderr) => {
					resolve(stdout.toString());
				})
			)
		).split(/[\r\n]+/g);
	}
	for (const file of files) {
		if (file) {
			await ask_about_file(file).catch(console.error);
		}
	}
}

process
	.on('unhandledRejection', console.error)
	.on('uncaughtException', console.error);
