import { URL } from "url";
import { ViewColumn, window, commands, Uri, WebviewPanel } from "vscode";
import { state } from "./sharedState";

const containerStyles = "background: #fff; position: absolute; top: 0; bottom: 0; left: 0; right: 0;";
const iframeStyles = "width: 100%; height: 100%; border: none;";
const sandboxOptions = "allow-same-origin allow-scripts allow-popups allow-forms";

function getHtml(uri: string): string {
    return `
        <div style="${containerStyles}">
            <iframe style="${iframeStyles}" sandbox="${sandboxOptions}" src="${uri}"></iframe>
        </div>
    `
}

export function registerOpenWebviewCommand() {
    state.context?.subscriptions.push(
        commands.registerCommand("livebook.openWebview", () => {

            if (!state.uri) return;

            const panel = window.createWebviewPanel('livebookWebview', 'Livebook', ViewColumn.One, {
                enableScripts: true,
                enableForms: true,
                retainContextWhenHidden: true
            });

            const key = state.panels.push(panel) - 1;
            panel.onDidDispose(() => delete state.panels[key]);

            openInDocumentIfFocusedOrAtHome(panel);
            setPanelIcon(panel);
        })
    );
}

function setPanelIcon(panel: WebviewPanel) {
    if (!state.context) return;
    panel.iconPath = Uri.joinPath(state.context.extensionUri, 'images', 'livebook.png');
}

function openInDocumentIfFocusedOrAtHome(panel: WebviewPanel) {
    const currentLanguageId = window.activeTextEditor?.document.languageId
    if (currentLanguageId === "markdown" || currentLanguageId === "livemarkdown") {
        const filePath = String(window.activeTextEditor?.document.uri.path);
        openFile(filePath, panel);
        return;
    }

    panel.webview.html = getHtml(state.uri);
}

export function openFile(filePath: string, panel?: WebviewPanel) {
    if (state.isRunning && panel) {
        const uri = String(generateImportFileUri(filePath));
        panel.webview.html = getHtml(uri);
        panel.reveal();
        return;
    }

    if (state.isRunning) {
        commands.executeCommand("livebook.openWebview");
        return;
    }

    commands.executeCommand("livebook.start");
}

function generateImportFileUri(filePath: string) {
    if (state.uri) {
        const url = new URL(`${state.uri}/import`)
        url.searchParams.append("url", `file://${filePath}`);
        return String(url);
    }
}

export function disposeWebviews() {
    for (const key in state.panels) {
        state.panels[key].dispose();
    }
}
