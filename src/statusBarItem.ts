import { StatusBarAlignment, commands, window } from "vscode";
import { disposeWebviews } from "./webview";
import { state } from "./sharedState";

export function createStatusBarItem() {
    state.itemBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);

    state.itemBar.text = "VSCode Livebook";
    state.itemBar.tooltip = "Loading...";
    state.context?.subscriptions.push(state.itemBar);
    state.itemBar.show();

    watchLoop();
}

async function watchLoop() {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 500));
        doWatchLoop();
    }
}

function doWatchLoop() {
    if (!state.itemBar) return;

    const startingText = "Livebook starting...";
    if (state.itemBar.text !== startingText && state.processPid && !state.isRunning) {
        state.itemBar.text = startingText;
        state.itemBar.color = "#ff87a7";
        state.itemBar.command = "livebook.stop";
        state.itemBar.tooltip = "Wait a little for the server to start...";
        return;
    }

    const onText = "Livebook on";
    if (state.itemBar.text !== onText && state.processPid && state.isRunning) {
        state.itemBar.color = "#ff87a7";
        state.itemBar.text = "Livebook on";
        state.itemBar.command = "livebook.stop";
        state.itemBar.tooltip = "Click to stop the server";
        commands.executeCommand("livebook.openWebview");
        return;
    }

    const offText = "Livebook off";
    if (state.itemBar.text !== offText && !(state.processPid || state.isRunning)) {
        state.itemBar.color = undefined;
        state.itemBar.text = "Livebook off";
        state.itemBar.command = "livebook.start";
        state.itemBar.tooltip = "Click to start the server";
        disposeWebviews();
    }
}
