import { URL } from "url";
import { ViewColumn, window, commands, Uri } from "vscode";
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

export function registerWebview() {
    state.context?.subscriptions.push(
        commands.registerCommand("livebook.openWebview", () => {

            if (!state.uri) return;

            state.panel = window.createWebviewPanel('livebookWebview', 'Livebook', ViewColumn.One, {
                enableScripts: true,
                enableForms: true,
                retainContextWhenHidden: true
            });

            state.panel.onDidDispose(() => delete state.panel);

            openInDocumentIfFocusedOrAtHome();
            setPanelIcon();
        })
    );
}

function setPanelIcon() {
    if (!state.context || !state.panel) return;
    state.panel.iconPath = Uri.joinPath(state.context.extensionUri, 'images', 'livebook.png');
}

function openInDocumentIfFocusedOrAtHome() {
    if (!state.panel) return;

    const currentLanguageId = window.activeTextEditor?.document.languageId
    if (currentLanguageId === "markdown" || currentLanguageId === "livemarkdown") {
        const filePath = String(window.activeTextEditor?.document.uri.path);
        openFile(filePath);
        return;
    }

    state.panel.webview.html = getHtml(state.uri);
}

export function openFile(filePath: string) {
    if (state.isRunning && !state.panel) {
        commands.executeCommand("livebook.openWebview");
        return;
    }

    if (state.isRunning && state.panel) {
        const uri = String(generateImportFileUri(filePath));
        state.panel.webview.html = getHtml(uri);
        state.panel.reveal();
        return;
    }

    commands.executeCommand("livebook.startLivebook");
}

function generateImportFileUri(filePath: string) {
    if (state.uri) {
        const url = new URL(`${state.uri}/import`)
        url.searchParams.append("url", `file://${filePath}`);
        return String(url);
    }
}

export function disposeWebview() {
    if (!state.panel) return;
    state.panel.dispose();
    delete state.panel;
}
