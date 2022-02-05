import { ChildProcess } from "child_process";
import { ExtensionContext, OutputChannel, StatusBarItem, WebviewPanel } from "vscode";

export const state: {
    uri?: string;
    process?: ChildProcess;
    panel?: WebviewPanel;
    itemBar?: StatusBarItem;
    context?: ExtensionContext;
    outputChannel?: OutputChannel;
} = {};

export function setState(name: "uri" | "process" | "panel" | "itemBar" | "context" | "outputChannel", value: any): void {
    state[name] = value;
}

