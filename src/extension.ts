import { ExtensionContext, window, OutputChannel, extensions } from "vscode";
import * as os from "os";
import * as statusBarItem from "./statusBarItem";

function showDebugInfo(outputChannel: OutputChannel): void {
	const extension = extensions.getExtension("josecfreittas.livebook");
	if (!extension) return;

	outputChannel.appendLine(`Livebook for VSCode version ${extension.packageJSON.version}`);
	outputChannel.appendLine(`Operating System Version ${os.platform()} ${os.release()}`);
}

export function activate(context: ExtensionContext) {

	const { createOutputChannel } = window;
	const outputChannel = createOutputChannel("Livebook");

	showDebugInfo(outputChannel);

	statusBarItem.createStatusBarItem(context, outputChannel);
}

export function deactivate() { }
