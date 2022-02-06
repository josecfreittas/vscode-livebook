import { ExtensionContext, window, extensions, commands } from "vscode";
import { createPidStateFileIfNotExists, watchPidLoop, state } from "./sharedState";
import { startServer, stopServer } from "./livebookServer";
import { openFile, registerWebview } from "./webview";
import { createStatusBarItem } from "./statusBarItem";
import * as os from "os";

function showDebugInfo(): void {
	const extension = extensions.getExtension("josecfreittas.livebook");
	if (!extension || !state.outputChannel) return;

	state.outputChannel.appendLine(`Livebook for VSCode version ${extension.packageJSON.version}`);
	state.outputChannel.appendLine(`Operating System Version ${os.platform()} ${os.release()}`);
}

function createOutputChannel(): void {
	const { createOutputChannel } = window;
	state.outputChannel = createOutputChannel("Livebook");
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

	state.context = context;

	createPidStateFileIfNotExists();
	createOutputChannel();

	state.context?.subscriptions.push(commands.registerCommand("livebook.startLivebook", async () => {
		console.log("starting Livebook");
		startServer();
	}));

	state.context?.subscriptions.push(commands.registerCommand("livebook.stopLivebook", async () => {
		console.log("stopping Livebook");
		stopServer();
	}));

	showDebugInfo();
	registerWebview();
	createStatusBarItem();
	registerOpenFileCommand();
	watchPidLoop();
}

export function deactivate() { }
