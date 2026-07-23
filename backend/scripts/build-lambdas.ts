import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const lambdasDir = path.resolve(rootDir, 'src/lambdas');
const distDir = path.resolve(rootDir, 'dist');

async function build() {
  const args = process.argv.slice(2);
  const targetLambdaArg = args.find((arg) => arg.startsWith('--lambda='));
  const targetLambda = targetLambdaArg ? targetLambdaArg.split('=')[1] : null;

  if (!fs.existsSync(lambdasDir)) {
    console.error(`Lambdas directory not found at: ${lambdasDir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(lambdasDir, { withFileTypes: true });
  const lambdaFolders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !targetLambda || name === targetLambda);

  if (lambdaFolders.length === 0) {
    console.warn(`No matching lambda folders found to build${targetLambda ? ` for --lambda=${targetLambda}` : ''}.`);
    return;
  }

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  console.log(`🚀 Starting build for ${lambdaFolders.length} Lambda function(s): [${lambdaFolders.join(', ')}]`);

  for (const lambdaName of lambdaFolders) {
    const lambdaSrcDir = path.join(lambdasDir, lambdaName);
    const entryPoint = path.join(lambdaSrcDir, 'handler.ts');

    if (!fs.existsSync(entryPoint)) {
      console.warn(`⚠️ Warning: Entrypoint ${entryPoint} does not exist. Skipping ${lambdaName}.`);
      continue;
    }

    const tempBuildDir = path.join(distDir, `temp-${lambdaName}`);
    if (fs.existsSync(tempBuildDir)) {
      fs.rmSync(tempBuildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempBuildDir, { recursive: true });

    const bundleFile = path.join(tempBuildDir, 'index.js');
    const zipOutputFile = path.join(distDir, `${lambdaName}.zip`);

    console.log(`  📦 [${lambdaName}] Compiling TypeScript bundle with esbuild...`);
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      minify: true,
      sourcemap: false,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: bundleFile,
      external: ['@aws-sdk/*'], // AWS SDK v3 is available in Node.js 18+ Lambda runtime
      banner: {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
      },
    });

    console.log(`  🤐 [${lambdaName}] Creating deployment archive ${lambdaName}.zip...`);
    try {
      execSync(`cd "${tempBuildDir}" && zip -r "${zipOutputFile}" index.js`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Failed to zip bundle for ${lambdaName}:`, err);
      process.exit(1);
    }

    // Clean up temporary folder
    fs.rmSync(tempBuildDir, { recursive: true, force: true });
    console.log(`  ✅ [${lambdaName}] Built successfully -> ${zipOutputFile}`);
  }

  console.log(`✨ Build completed successfully for all targeted Lambdas.`);
}

build().catch((err) => {
  console.error('Fatal build error:', err);
  process.exit(1);
});
