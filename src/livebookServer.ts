import { exec } from "child_process";
import { state } from "./sharedState";

function setUri(uri: string): void {
    uri = uri.replace("[Livebook] Application running at", "").trim();
    if (uri.charAt(uri.length - 1) !== "/") {
        uri = `${uri}/`;
    }
    state.uri = uri;
}

export async function startServer(): Promise<void> {
    const livebookBuild = state.context?.asAbsolutePath('./livebook');

    state.process = exec(`${livebookBuild} server --no-token --port 23478`);
    if (state.process.stdout) {
        state.process.stdout.setEncoding('utf8');
        state.process.stdout.on('data', function (data) {
            if (data.startsWith("[Livebook] Application running at")) setUri(data);

            state.outputChannel?.appendLine(data);
            console.log(data);
        });
    }

    state.process.addListener("close", () => stopServer());
    state.process.addListener("disconnect", () => stopServer());
    state.process.addListener("error", () => stopServer());
    state.process.addListener("exit", () => stopServer());

    state.outputChannel?.appendLine("Livebook server starting...");
}

export function stopServer(): void {
    if (!state.process) return;

    try {
        state.process.removeAllListeners()
        state.process.kill();
    } catch (error) {
        console.log(error);
    }

    delete state.uri;
    delete state.process;
}
