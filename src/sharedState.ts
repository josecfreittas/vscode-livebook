import { ExtensionContext, OutputChannel, StatusBarItem, WebviewPanel } from "vscode";
import * as path from "path";
import * as fs from "fs";

export const state: {
    uri: string;
    isRunning: boolean;
    panels: WebviewPanel[];
    processPid?: number;
    itemBar?: StatusBarItem;
    context?: ExtensionContext;
    outputChannel?: OutputChannel;
} = { uri: "http://localhost:23478", isRunning: false, panels: [] };

export function createPidStateFileIfNotExists(): void {
    const dirPath = String(state.context?.globalStorageUri.path);
    const filePath = path.join(dirPath, "pid");

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "");
}

export function updatePidStateFile(process: number | null): void {
    let pid = ""
    if (process) pid = String(process);

    const dirPath = String(state.context?.globalStorageUri.path);
    const filePath = path.join(dirPath, "pid");

    console.log("Updating persisted pid");
    fs.writeFileSync(filePath, pid);
}

export async function watchPidLoop() {
    while (true) {
        doWatchPidLoop();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}


function doWatchPidLoop() {
    const dirPath = String(state.context?.globalStorageUri.path);
    const filePath = path.join(dirPath, "pid");

    const storagePid = Number(fs.readFileSync(filePath, "utf8"));

    if (storagePid !== state.processPid) {
        if (storagePid) {
            if (!pidIsRunning(storagePid)) {
                updatePidStateFile(null);
                return;
            }
            state.processPid = storagePid;
            state.isRunning = true;
            return;
        }

        delete state.processPid;
        state.isRunning = false;
    }
}

function pidIsRunning(pid: number): boolean {
    try {
        process.kill(pid, 0);
        return true;
    } catch (e) {
        return false;
    }
}