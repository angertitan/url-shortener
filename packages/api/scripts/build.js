const build = require('@xmts/scripts/build');
const { resolve } = require('path');

const MINIFY = process.argv.includes('--minify');
const DRY = process.argv.includes('--dry');
const PRODBUILD = process.argv.includes('--prod');
const ROOTDIR = `${__dirname}/..`;

build(resolve(ROOTDIR, './src/main.ts'), {
	dry: DRY,
	minify: MINIFY,
	prod: PRODBUILD,
	rootDir: ROOTDIR
});
