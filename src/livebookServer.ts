import { exec, ChildProcess, } from "child_process";
import { state, updatePidStateFile } from "./sharedState";

let livebookProcess: ChildProcess | null;

export async function startServer(): Promise<void> {
    const livebookBuild = state.context?.asAbsolutePath('./livebook');

    livebookProcess = exec(`${livebookBuild} server --no-token --port 23478`);
    if (livebookProcess.stdout) {
        livebookProcess.stdout.setEncoding('utf8');
        livebookProcess.stdout.on('data', function (data) {
            if (data.startsWith("[Livebook] Application running at")) state.isRunning = true;

            state.outputChannel?.appendLine(data);
            console.log(data);
        });
    }

    state.processPid = livebookProcess.pid;
    updatePidStateFile(state.processPid);

    livebookProcess.addListener("close", () => stopServer());
    livebookProcess.addListener("disconnect", () => stopServer());
    livebookProcess.addListener("error", () => stopServer());
    livebookProcess.addListener("exit", () => stopServer());

    state.outputChannel?.appendLine("Livebook server starting...");
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
