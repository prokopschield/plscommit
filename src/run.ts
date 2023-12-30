import { exec, ExecOptions } from 'child_process';

/**
 * Executes shell command
 *
 * @param {string} cmd shell command
 * @param {ExecOptions} options exec options
 * @returns {Promise<boolean>} Were there no errors?
 */
function run(cmd: string, options: ExecOptions = {}): Promise<boolean> {
	return new Promise((resolve) => {
		const child = exec(cmd, options, (error, _stdout, stderr) =>
			resolve(!stderr && !error)
		);
		if (process.stdout && child.stdout)
			child.stdout.on('data', (chunk: Buffer) =>
				process.stdout.write(chunk)
			);
		if (process.stderr && child.stderr)
			child.stderr.on('data', (chunk: Buffer) =>
				process.stderr.write(chunk)
			);
	});
}

export = run;
