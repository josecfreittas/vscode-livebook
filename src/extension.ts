import { ExtensionContext, window, extensions, commands } from "vscode";
import { createStatusBarItem } from "./statusBarItem";
import { setState, state } from "./sharedState";
import { openFile, registerWebview } from "./webview";
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

function registerOpenFileCommand() {
	state.context?.subscriptions.push(commands.registerCommand("livebook.openFile", async (args) => {
		console.log("Opening Livebook notebook...");
		const activeEditor = window.activeTextEditor;
		if (!activeEditor) return;
		openFile(activeEditor.document.uri.path);
	}));
}

export function activate(context: ExtensionContext) {

	setState("context", context);

	createOutputChannel();

	showDebugInfo();
	registerWebview();
	createStatusBarItem();
	registerOpenFileCommand();
}

export function deactivate() { }
