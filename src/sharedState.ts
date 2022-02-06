import { ChildProcess } from "child_process";
import { ExtensionContext, OutputChannel, StatusBarItem, WebviewPanel } from "vscode";
import * as path from "path";
import * as fs from "fs";

export function createPidStateFileIfNotExists(): void {
    const dirPath = String(state.context?.globalStorageUri.path);
    const filePath = path.join(dirPath, "pid");

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(path.dirname(dirPath));
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "");
    }
}

export function updatePidStateFile(process: number | null): void {
    let pid = ""
    if (process) pid = String(process);

    const dirPath = String(state.context?.globalStorageUri.path);
    const filePath = path.join(dirPath, "pid");

    console.log("updating pid");
    fs.writeFileSync(filePath, pid);
}

export const state: {
    uri: string;
    isRunning: boolean;
    processPid?: number;
    panel?: WebviewPanel;
    itemBar?: StatusBarItem;
    context?: ExtensionContext;
    outputChannel?: OutputChannel;
} = { isRunning: false, uri: "http://localhost:23478" };

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