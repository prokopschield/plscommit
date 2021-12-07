import prompts from 'prompts';

// Do no change this.
const NAME = 'NAME';

async function ask(question: string | null = null): Promise<string> {
	return prompts([
		{
			type: 'text',
			name: NAME,
			message: question || '',
		},
	]).then((a) => a.NAME);
}

export = ask;
