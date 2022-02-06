import { exec, ChildProcess, } from "child_process";
import { state, updatePidStateFile } from "./sharedState";

let livebookProcess: ChildProcess | null;

function logSdout(process: ChildProcess) {
    if (process.stdout) {
        process.stdout.setEncoding('utf8');
        process.stdout.on('data', function (data) {
            if (data.startsWith("[Livebook] Application running at")) state.isRunning = true;

            state.outputChannel?.appendLine(data);
            console.log(data);
        });
    }
}

function addListeners(process: ChildProcess) {
    process.addListener("close", () => stopServer());
    process.addListener("disconnect", () => stopServer());
    process.addListener("error", () => stopServer());
    process.addListener("exit", () => stopServer());
}

export async function startServer(): Promise<void> {
    const livebookBuild = state.context?.asAbsolutePath('./livebook');

    state.outputChannel?.appendLine("Livebook server is starting...");

    livebookProcess = exec(`${livebookBuild} server --no-token --port 23478`);
    logSdout(livebookProcess);
    addListeners(livebookProcess);

    state.processPid = livebookProcess.pid;
    updatePidStateFile(state.processPid);
}

export function stopServer(): void {

    try {
        if (livebookProcess) {
            livebookProcess.removeAllListeners()
            livebookProcess.kill();
        }
        if (state.processPid) {
            process.kill(state.processPid);
        }
    } catch (error) {
        console.log(error);
    }

    livebookProcess = null;
    state.isRunning = false;
    delete state.processPid;
    updatePidStateFile(null);
}
