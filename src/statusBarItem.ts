import { ExtensionContext, OutputChannel, StatusBarItem, StatusBarAlignment, ViewColumn, commands, window, WebviewPanel } from "vscode";
import { watchServerStatus, startServer, stopServer } from "./livebookServer";

let itemBar: StatusBarItem | null;
let panel: WebviewPanel | null;
let serverUri: string | null;

export function createStatusBarItem(context: ExtensionContext, outputChannel: OutputChannel) {

    itemBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);

    context.subscriptions.push(commands.registerCommand("livebook.startLivebook", async () => {
        console.log("starting Livebook");
        startServer(context, outputChannel);
    }));

    context.subscriptions.push(commands.registerCommand("livebook.stopLivebook", async () => {
        console.log("stopping Livebook");
        stopServer();
    }));

    context.subscriptions.push(
        commands.registerCommand("livebook.openWebView", () => {
            // Create and show a new webview
            panel = window.createWebviewPanel(
                'livebookWebView', // Identifies the type of the webview. Used internally
                'Livebook', // Title of the panel displayed to the user
                ViewColumn.One, // Editor column to show the new webview panel in.
                {
                    enableScripts: true,
                    enableForms: true,
                    retainContextWhenHidden: true
                }
            );
            panel.webview.html = `
                <div style='background: #fff; position: absolute; top: 0; bottom: 0; left: 0; right: 0;'>
                    <iframe src='${serverUri}' style='border: none' sandbox='allow-same-origin allow-scripts allow-popups allow-forms' width='100%' height='100%'></iframe>
                </div>
            `;
        })
    );

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
            serverUri = status.uri;
            commands.executeCommand("livebook.openWebView");

            itemBar.text = "Livebook on";
            itemBar.color = "#ff87a7";
            itemBar.command = "livebook.stopLivebook";
            itemBar.tooltip = "Click to stop the server";
            return;
        }

        const offText = "Livebook off";
        if (itemBar.text !== offText && !(status.processUp || status.uri)) {
            if (panel) {
                panel.dispose();
                panel = null;
            };
            itemBar.text = "Livebook off";
            itemBar.color = undefined;
            itemBar.command = "livebook.startLivebook";
            itemBar.tooltip = "Click to start the server";
        }
    });
}
