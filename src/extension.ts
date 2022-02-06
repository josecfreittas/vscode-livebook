import { ExtensionContext, window, extensions, commands } from "vscode";
import { createPidStateFileIfNotExists, watchPidLoop, state } from "./sharedState";
import { startServer, stopServer } from "./livebookServer";
import { openFile, registerOpenWebviewCommand } from "./webview";
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

function registerStartAndStopCommands() {
	state.context?.subscriptions.push(
		commands.registerCommand("livebook.start", async () => {
			console.log("Starting Livebook...");
			startServer();
		}),
		commands.registerCommand("livebook.stop", async () => {
			console.log("Stopping Livebook...");
			stopServer();
		})
	);
}

export function activate(context: ExtensionContext) {
	state.context = context;

	createPidStateFileIfNotExists();
	createOutputChannel();
	showDebugInfo();

	registerStartAndStopCommands();
	registerOpenWebviewCommand();
	registerOpenFileCommand();
	createStatusBarItem();
	watchPidLoop();
}

export function deactivate() { }
