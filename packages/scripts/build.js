const { build: esbuild } = require('esbuild');

/**
 *
 * @param {string} entryPoint
 * @param {{ minify: boolean, dry: boolean, rootDir: string, prod: boolean } } options
 */
module.exports = async function build(entryPoint, options = { rootDir: '' }) {
	const { minify, dry, rootDir, prod } = options;

	if (prod) {
		console.log('Production build, ignoring all other args.');
	}

	try {
		esbuild({
			entryPoints: [entryPoint],
			outdir: `${rootDir}/dist`,
			bundle: true,
			minify: prod ? true : minify,
			define: {
				DRY_RUN: prod ? false : dry
			},
			pure: minify || prod ? ['console.log'] : [],
			format: 'cjs',
			loader: {
				'.html': 'text'
			}
		});
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
