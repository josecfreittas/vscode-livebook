import { ViewColumn, window, commands, Uri } from "vscode";
import { state } from "./sharedState";

const containerStyles = "background: #fff; position: absolute; top: 0; bottom: 0; left: 0; right: 0;";
const iframeStyles = "width: 100%; height: 100%; border: none;";
const sandboxOptions = "allow-same-origin allow-scripts allow-popups allow-forms";


export function registerWebview() {
    state.context?.subscriptions.push(
        commands.registerCommand("livebook.openWebview", () => {

            if (!state.uri) return;

            state.panel = window.createWebviewPanel('livebookWebview', 'Livebook', ViewColumn.One, {
                enableScripts: true,
                enableForms: true,
                retainContextWhenHidden: true
            });

            state.panel.webview.html = `
                <div style="${containerStyles}">
                    <iframe style="${iframeStyles}" sandbox="${sandboxOptions}" src="${state.uri}"></iframe>
                </div>
            `;

            if (!state.context) return;
            state.panel.iconPath = Uri.joinPath(state.context.extensionUri, 'images', 'livebook.png');

            state.panel.onDidDispose(() => commands.executeCommand("livebook.stopLivebook"));
        })
    );
}

export function disposeWebview() {
    if (!state.panel) return;
    state.panel.dispose();
    delete state.panel;
}
