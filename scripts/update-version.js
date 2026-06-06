const version = Bun.argv[2];

if (!version) {
	console.error('Usage: bun scripts/update-version.js <version>');
	process.exit(1);
}

const pkgPath = 'package.json';

const pkgFile = Bun.file(pkgPath);
const pkg = await pkgFile.json();

pkg.version = version;

await Bun.write(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`);

const versionFilePath = 'src/lib/utils/version.ts';
const tag = `v${version}`;

await Bun.write(versionFilePath, `export const VERSION = "${tag}";\n`);
