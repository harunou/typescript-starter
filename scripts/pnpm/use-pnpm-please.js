#!node
// vim:set et sw=4 ft=javascript:

const fs = require('fs');

main();
function main() {
    const BACKGROUND_RED = '\033[41m';
    const BACKGROUND_RESET = '\033[0m';
    const WORKFLOW_PATH = '.github/workflows/workflow.yaml';

    const workflowPnpmVersion = getWorkflowPnpmVersion(WORKFLOW_PATH);

    if (!isPnpmInUse()) {
        console.log();
        console.log(
            `${BACKGROUND_RED}     ${BACKGROUND_RESET} Use PnPM please! ${BACKGROUND_RED}     ${BACKGROUND_RESET}`
        );
        console.log();
        process.exit(1);
    }

    if (workflowPnpmVersion && workflowPnpmVersion !== pnpmVersionInUse()) {
        console.log();
        console.log(
            `${BACKGROUND_RED}     ${BACKGROUND_RESET} Use PnPM version ${workflowPnpmVersion} please! ${BACKGROUND_RED}     ${BACKGROUND_RESET}`
        );
        console.log();
        process.exit(1);
    }

    console.log(`PmPM version ${pnpmVersionInUse()} in use.`);
    process.exit(0);
}

/**
 * @param {string} workflowPath - Path to the workflow file
 * @returns {string | null} - Required PNPM version
 */
function getWorkflowPnpmVersion(workflowPath) {
    const VERSION_REGEX = /name:\s*Setup pnpm[\s\S]*?version:\s*(\d+\.\d+\.\d+)/;
    try {
        const workflowFile = fs.readFileSync(workflowPath).toString('utf8');
        const match = workflowFile.match(VERSION_REGEX);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

/**
 * @returns {boolean} - Whether PNPM is in use
 */
function isPnpmInUse() {
    return /^pnpm/.test(process.env.npm_config_user_agent);
}

/**
 * @returns {string | null} - Version of PNPM in use
 */
function pnpmVersionInUse() {
    const pnpmVersionRegex = /pnpm\/(\d+\.\d+\.\d+)/;
    const match = process.env.npm_config_user_agent.match(pnpmVersionRegex);
    return match ? match[1] : null;
}
