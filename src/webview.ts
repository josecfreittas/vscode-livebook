import { ExtensionContext, ViewColumn, window, commands, Uri, WebviewPanel } from "vscode";

let panel: WebviewPanel | null;

const containerStyles = "background: #fff; position: absolute; top: 0; bottom: 0; left: 0; right: 0;";
const iframeStyles = "width: 100%; height: 100%; border: none;";
const sandboxOptions = "allow-same-origin allow-scripts allow-popups allow-forms";


export function registerWebview(context: ExtensionContext, serverInfo: { uri: string | null }) {
    context.subscriptions.push(
        commands.registerCommand("livebook.openWebview", () => {

            if (!serverInfo.uri) return;

            panel = window.createWebviewPanel('livebookWebview', 'Livebook', ViewColumn.One, {
                enableScripts: true,
                enableForms: true,
                retainContextWhenHidden: true
            });

            panel.webview.html = `
                <div style="${containerStyles}">
                    <iframe style="${iframeStyles}" sandbox="${sandboxOptions}" src="${serverInfo.uri}"></iframe>
                </div>
            `;

            panel.iconPath = Uri.joinPath(context.extensionUri, 'images', 'livebook.png');

            panel.onDidDispose(() => commands.executeCommand("livebook.stopLivebook"));
        })
    );
}

export function disposeWebview() {
    if (!panel) return;

    panel.dispose();
    panel = null;
}