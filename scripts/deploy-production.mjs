import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const envFilePath = resolve(projectRoot, '.env');
const migrationsPath = resolve(
    projectRoot,
    'src',
    'pollModule',
    'persistence',
    'migrations',
);

const env = process.env;

const loadEnvFile = (filePath) => {
    if (!existsSync(filePath)) {
        return;
    }

    const fileContent = readFileSync(filePath, 'utf8');
    const lines = fileContent.split(/\r?\n/);

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line || line.startsWith('#')) {
            continue;
        }

        const separatorIndex = line.indexOf('=');

        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();

        if (!key || env[key] !== undefined) {
            continue;
        }

        let value = line.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        env[key] = value;
    }
};

loadEnvFile(envFilePath);

if (!env.DATABASE_URL) {
    console.error(
        'DATABASE_URL is required. Define it in the environment or in the project .env file.',
    );
    process.exit(1);
}

if (!existsSync(envFilePath)) {
    console.warn(
        'Project .env file was not found. Continuing with environment variables provided by the shell.',
    );
}

if (!existsSync(migrationsPath)) {
    console.error(
        'Prisma migrations were not found in src/pollModule/persistence/migrations. Create and commit the migrations before running production deploy.',
    );
    process.exit(1);
}

const run = (command, args) => {
    console.log(`\n> ${command} ${args.join(' ')}`);

    const windowsArgs = ['/c', command, ...args];
    const result = spawnSync(
        process.platform === 'win32' ? 'cmd.exe' : command,
        process.platform === 'win32' ? windowsArgs : args,
        {
            cwd: projectRoot,
            stdio: 'inherit',
            env,
            shell: false,
        },
    );

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

run('npm', ['ci']);
run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'migrate', 'deploy']);
run('npm', ['run', 'build']);

console.log(
    '\nProduction build finished. Start the server manually with: npm run start',
);
