import * as vscode from 'vscode'
import { window, commands, Selection } from 'vscode'
import FileService from './service'
let wpStatus: vscode.StatusBarItem

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "workpoints" is now active!')

	let files: Files = {}

	wpStatus = window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000)
	wpStatus.command = 'workpoints.showpoints'
	context.subscriptions.push(wpStatus)

	// TODO
	// when lines are added => update fileservice points []
	// when lines are delete => remove from fileservice points []
	// Maybe this
	// context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(() => {}))

	context.subscriptions.push(commands.registerCommand('workpoints.setpoint', SetPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.setpoint', PrevPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.setpoint', NextPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.setpoint', ShowPoints))

	// 
	// Commands
	// 

	function SetPoint() {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		const cursorPosition = editor.selection.active.line + 1
		const fileName = editor.document.fileName
		let service = files[fileName]

		if (!service) {
			files[fileName] = new FileService()
			service = files[fileName]
			console.log(files)
		}

		service.points.includes(cursorPosition)
			? service.RemovePoint(cursorPosition)
			: service.AddPoint(cursorPosition)

		if (service.points.length === 0)
			delete files[fileName]

		updateStatus(service)
	}
	function PrevPoint() {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('_Editor Not Found.')

		let service = files[editor.document.fileName]
		if (!service || service.points.length === 0)
			return window.showInformationMessage('No Workpoints, Add (Ctrl+Shift+/).')

		service.DecementActivePoint()
		console.log("NEW ACTIVE " + service.ActivePoint())
		movePoint(editor, service)
	}
	function NextPoint() {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('_Editor Not Found.')

		let service = files[editor.document.fileName]
		if (!service || service.points.length === 0)
			return window.showInformationMessage('No Workpoints, Add (Ctrl+Shift+/).')

		service.IncementActivePoint()
		console.log("NEW ACTIVE " + service.ActivePoint())
		movePoint(editor, service)
	}

	function ShowPoints() {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		window.showInformationMessage(`Workpoints: ${files[editor.document.fileName].points.map(p => ' ' + p)}`)
	}

	// 
	// Functions
	// 

	function movePoint(editor: vscode.TextEditor, service: FileService): void | Thenable<string | undefined> {
		const newPosition = editor.selection.active.with(service.ActivePoint() - 1, 0)
		const newRange = editor.document.lineAt(service.ActivePoint()).range

		editor.selection = new Selection(newPosition, newPosition)
		editor.revealRange(newRange, vscode.TextEditorRevealType.InCenter)
		updateStatus(service)
		console.log('MOVED');
	}

	function updateStatus(service: FileService): void | Thenable<string | undefined> {
		const points = service.points

		if (points.length > 0) {
			const active = service.ActivePoint()
			let status = ` ( ${active} ) `
			let prev2 = points[service.active - 2]
			let prev1 = points[service.active - 1]
			let next1 = points[service.active + 1]
			let next2 = points[service.active + 2]

			if (points.length >= 3) {
				if (service.active === 0) {
					prev1 = points[points.length - 1]
				} else if (service.active === points.length - 1) {
					next1 = points[0]
				}
				status = `${prev1} ( ${active} ) ${next1}`
			}

			if (points.length >= 5) {
				if (service.active === 0) {
					prev1 = points[points.length - 1]
					prev2 = points[points.length - 2]
				} else if (service.active === 1) {
					prev1 = points[0]
					prev2 = points[points.length - 1]
				} else if (service.active === points.length - 2) {
					next1 = points[points.length - 1]
					next2 = points[0]
				} else if (service.active === points.length - 1) {
					next1 = points[0]
					next2 = points[1]
				}
				status = `${prev2} | ${prev1} ( ${active} ) ${next1} | ${next2}`
			}

			wpStatus.text = status
			wpStatus.show()
		} else {
			wpStatus.hide()
		}
		console.log(service)
	}
}

export function deactivate() { }
