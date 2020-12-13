const concurrently = require('concurrently');

const args = process.argv.slice(2).join(' ');

concurrently(
	[
		{ command: `yarn:dev:js ${args}`, prefixColor: 'blue', name: 'build' },
		{ command: 'yarn:wrgl:dev', prefixColor: 'magenta', name: 'wrangler' }
	],
	{
		killOthers: ['failure']
	}
);
