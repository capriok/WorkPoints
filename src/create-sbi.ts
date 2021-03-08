import * as vscode from 'vscode'

let wpStatus: vscode.StatusBarItem

export function createStatusBarItem(context: vscode.ExtensionContext): vscode.StatusBarItem {
	wpStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000)
	wpStatus.command = 'workpoints.showpoints'
	context.subscriptions.push(wpStatus)
	return wpStatus
}