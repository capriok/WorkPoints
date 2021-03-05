import * as vscode from 'vscode';
import FileService from './service';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "workpoints" is now active!');

	let files: Files = {};

	console.log(files);

	let setPoint = vscode.commands.registerCommand('workpoints.setpoint', () => {
		const _editor = vscode.window.activeTextEditor
		if (!_editor)
			return vscode.window.showInformationMessage('Editor Not Found.')

		const cursorPosition = _editor.selection.active.line + 1
		const fileName = _editor.document.fileName
		let currentService = files[fileName]

		if (!currentService) {
			files[fileName] = new FileService()
			currentService = files[fileName]
			console.log(files)
		}

		currentService.AddWorkPoint(cursorPosition)
		console.log(currentService)

		vscode.window.showInformationMessage(`Added Line ${cursorPosition} to Workpoints`)
	})

	let prevPoint = vscode.commands.registerCommand('workpoints.prevpoint', () => {
		const _editor = vscode.window.activeTextEditor
		if (!_editor)
			return vscode.window.showInformationMessage('_Editor Not Found.')

		const fileName = _editor.document.fileName
		let currentService = files[fileName]
		const position = _editor.selection.active

		if (!currentService || currentService.points.length === 0)
			return vscode.window.showInformationMessage('No WorkPoints, Add (Ctrl+Shift+/).')

		currentService.DecementActiveWorkPoint()
		const newPosition = position.with(currentService.GetActive() - 1, 0)
		const newRange = _editor.document.lineAt(currentService.GetActive()).range

		_editor.selection = new vscode.Selection(newPosition, newPosition)
		_editor.revealRange(newRange)

		console.log(currentService)
		vscode.window.showInformationMessage(`Skipped to line: ${newPosition.line + 1} of [ ${currentService.points.map(p => ' ' + p).toString()} ]`)
	})

	let nextPoint = vscode.commands.registerCommand('workpoints.nextpoint', () => {
		const _editor = vscode.window.activeTextEditor
		if (!_editor)
			return vscode.window.showInformationMessage('_Editor Not Found.')

		const fileName = _editor.document.fileName
		let currentService = files[fileName]
		const position = _editor.selection.active

		if (!currentService || currentService.points.length === 0)
			return vscode.window.showInformationMessage('No WorkPoints, Add (Ctrl+Shift+/).')

		currentService.IncementActiveWorkPoint()
		const newPosition = position.with(currentService.GetActive() - 1, 0)
		const newRange = _editor.document.lineAt(currentService.GetActive()).range

		_editor.selection = new vscode.Selection(newPosition, newPosition)
		_editor.revealRange(newRange)

		console.log(currentService)
		vscode.window.showInformationMessage(`Skipped to line: ${newPosition.line + 1} of [ ${currentService.points.map(p => ' ' + p).toString()} ]`)
	})

	context.subscriptions.push(setPoint)
	context.subscriptions.push(nextPoint)
	context.subscriptions.push(prevPoint)

}

export function deactivate() { }
