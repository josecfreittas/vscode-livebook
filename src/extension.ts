import { ExtensionContext, window, extensions } from "vscode";
import { createStatusBarItem } from "./statusBarItem";
import { setState, state } from "./sharedState";
import { registerWebview } from "./webview";
import * as os from "os";

function showDebugInfo(): void {
	const extension = extensions.getExtension("josecfreittas.livebook");
	if (!extension || !state.outputChannel) return;

	state.outputChannel.appendLine(`Livebook for VSCode version ${extension.packageJSON.version}`);
	state.outputChannel.appendLine(`Operating System Version ${os.platform()} ${os.release()}`);
}

function createOutputChannel(): void {
	const { createOutputChannel } = window;
	setState("outputChannel", createOutputChannel("Livebook"));
}

export function activate(context: ExtensionContext) {

	setState("context", context);

	createOutputChannel();

	showDebugInfo();
	registerWebview();
	createStatusBarItem();
}

export function deactivate() { }
