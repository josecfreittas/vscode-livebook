import { ExtensionContext, OutputChannel } from "vscode";
import { ChildProcess, exec } from "child_process";

let process: ChildProcess | null;
let uri: string | null;

export async function startServer(context: ExtensionContext, outputChannel: OutputChannel): Promise<void> {
    const livebookBuild = context.asAbsolutePath('./livebook');

    process = exec(`${livebookBuild} server --port 23478`);

    if (process.stdout) {
        process.stdout.setEncoding('utf8');
        process.stdout.on('data', function (data) {
            if (data.startsWith("[Livebook] Application running at ")) {
                uri = data.replace("[Livebook] Application running at ", "").trim();
            }

            outputChannel.appendLine(data);
            console.log(data);
        });
    }

    process.addListener("close", () => stopServer());
    process.addListener("disconnect", () => stopServer());
    process.addListener("error", () => stopServer());
    process.addListener("exit", () => stopServer());

    outputChannel.appendLine("Livebook server starting...");
}

export function stopServer(): void {
    if (!process) return;

    try {
        process.removeAllListeners()
        process.kill();
    }
    catch (error) {
        console.log(error);
    }

    uri = null;
    process = null;
}

export async function watchServerStatus(callback: Function) {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 500));
        callback({ processUp: !!process, uri });
    }
}
