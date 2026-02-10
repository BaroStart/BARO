import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const API_URL = process.env.VITE_API_URL;

if (!API_URL) {
  console.error('Error: VITE_API_URL is not set in .env');
  process.exit(1);
}

const specUrl = `${API_URL}/v3/api-docs`;
const outDir = 'src/generated';

const command = [
  'npx openapi-generator-cli generate',
  `-i ${specUrl}`,
  '-g typescript-axios',
  `-o ${outDir}`,
  '--skip-validate-spec',
  '--additional-properties=supportsES6=true,withInterfaces=true,useSingleRequestParameter=true',
].join(' ');

console.log(`Generating API client from: ${specUrl}`);

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to generate API client');
  process.exit(1);
}

// Post-process: add @ts-nocheck to generated .ts files
// (generated code may violate strict tsconfig rules like noUnusedLocals, verbatimModuleSyntax)
const tsFiles = readdirSync(outDir).filter((f) => f.endsWith('.ts'));
for (const file of tsFiles) {
  const filePath = join(outDir, file);
  const content = readFileSync(filePath, 'utf-8');
  if (!content.startsWith('// @ts-nocheck')) {
    writeFileSync(filePath, `// @ts-nocheck\n${content}`);
  }
}

// Post-process: remove unnecessary boilerplate files
const junkFiles = ['git_push.sh', '.npmignore', '.gitignore'];
for (const junk of junkFiles) {
  const junkPath = join(outDir, junk);
  if (existsSync(junkPath)) rmSync(junkPath);
}
const docsDir = join(outDir, 'docs');
if (existsSync(docsDir)) rmSync(docsDir, { recursive: true });

console.log('✓ Generated successfully in src/generated/');
