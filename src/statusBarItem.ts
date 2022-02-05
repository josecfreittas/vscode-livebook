import { ExtensionContext, OutputChannel, StatusBarItem, StatusBarAlignment, commands, window } from "vscode";
import { watchServerStatus, startServer, stopServer } from "./livebookServer";
import { disposeWebview, registerWebview } from "./webview";

let itemBar: StatusBarItem | null;
let serverInfo: { uri: string | null } = { uri: null };

export function createStatusBarItem(context: ExtensionContext, outputChannel: OutputChannel) {

    registerWebview(context, serverInfo);

    itemBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);

    context.subscriptions.push(commands.registerCommand("livebook.startLivebook", async () => {
        console.log("starting Livebook");
        startServer(context, outputChannel);
    }));

    context.subscriptions.push(commands.registerCommand("livebook.stopLivebook", async () => {
        console.log("stopping Livebook");
        stopServer();
    }));

    itemBar.text = "VSCode Livebook";
    itemBar.tooltip = "Loading...";
    context.subscriptions.push(itemBar);
    itemBar.show();

    watchServerStatus((status: { processUp: boolean, uri: string }) => {

        if (!itemBar) return;

        const startingText = "Livebook starting...";
        if (itemBar.text !== startingText && status.processUp && !status.uri) {
            itemBar.text = startingText;
            itemBar.color = "#ff87a7";
            itemBar.command = "livebook.stopLivebook";
            itemBar.tooltip = "Wait a little for the server to start...";
            return;
        }

        const onText = "Livebook on";
        if (itemBar.text !== onText && status.processUp && status.uri) {
            serverInfo.uri = status.uri;
            itemBar.text = "Livebook on";
            itemBar.color = "#ff87a7";
            itemBar.command = "livebook.stopLivebook";
            itemBar.tooltip = "Click to stop the server";
            commands.executeCommand("livebook.openWebview");
            return;
        }

        const offText = "Livebook off";
        if (itemBar.text !== offText && !(status.processUp || status.uri)) {
            itemBar.text = "Livebook off";
            itemBar.color = undefined;
            itemBar.command = "livebook.startLivebook";
            itemBar.tooltip = "Click to start the server";
            disposeWebview();
        }
    });
}
