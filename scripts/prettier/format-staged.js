#!node
// vim:set et sw=4 ft=javascript:
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

main();

function main() {
    const FILE_EXTENSIONS = [
        '*.ts',
        '*.tsx',
        '*.js',
        '*.jsx',
        '*.html',
        '*.json',
        '*.scss',
        '*.css',
    ];
    const stagedFiles = toArray(getStagedFiles(FILE_EXTENSIONS));
    if (!stagedFiles.length) {
        process.exit(0);
    }
    let hasFilesFormatted = true;
    try {
        formatFiles(stagedFiles);
    } catch (e) {
        hasFilesFormatted = false;
    }
    addToStaging(stagedFiles);
    if (!hasFilesFormatted) {
        console.log(`${getCurrentScriptName()}: Failed to format staged files`);
        process.exit(1);
    }
    console.log(`${getCurrentScriptName()}: Successfully formatted staged files`);
}

/**
 * @returns {string} - Name of the current script
 */
function getCurrentScriptName() {
    return path.basename(__filename);
}

/**
 * @param {string[]} extensions - Extensions of files to get from git
 * @returns {string} - List of files staged for commit
 */
function getStagedFiles(extensions) {
    const cmd = [
        'git diff',
        '--cached',
        '--name-only',
        '--diff-filter=ACMR',
        extensions.map(ext => `"${ext}"`).join(' '),
    ].join(' ');
    return execSync(cmd).toString('utf8');
}

/**
 * @param {string[]} files - List of files to add to staging
 * @returns {void}
 */
function addToStaging(files) {
    const cmd = ['git', 'add', ...files].join(' ');
    execSync(cmd, { stdio: 'inherit' });
}

/**
 * @param {string[]} files - List of files to format
 * @returns {void}
 */
function formatFiles(files) {
    const prettierBin = getPrettierBinary();
    const cmd = ['node', prettierBin, '--write', ...files].join(' ');
    execSync(cmd, { stdio: 'inherit' });
}

/**
 * @param {string} gitStdout
 * @returns {string[]} - Array of strings
 */
function toArray(gitStdout) {
    return gitStdout.split('\n').filter(item => item !== '');
}

/**
 * @returns {string} - Array of strings
 */
function getPrettierBinary() {
    const prettierPath = path.dirname(require.resolve('prettier'));
    const pkg = JSON.parse(fs.readFileSync(path.join(prettierPath, 'package.json'), 'utf-8'));
    return path.join(prettierPath, pkg.bin);
}
