import * as vscode from 'vscode'
import { window, commands, Selection } from 'vscode'
import FileService from './service'
let wpStatus: vscode.StatusBarItem

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "workpoints" is now active!')

	let files: Files = {}

	// 
	// StatusBarItem
	// 

	wpStatus = window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000)
	wpStatus.command = 'workpoints.showpoints'
	context.subscriptions.push(wpStatus)

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
			// console.log(files)
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
		movePoint(editor, service)
	}

	function NextPoint() {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('_Editor Not Found.')

		let service = files[editor.document.fileName]
		if (!service || service.points.length === 0)
			return window.showInformationMessage('No Workpoints, Add (Ctrl+Shift+/).')

		service.IncementActivePoint()
		movePoint(editor, service)
	}

	function ShowPoints() {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		const Destroy = 'Destroy Workpoints'
		window.showInformationMessage(`Workpoints: ${files[editor.document.fileName].points.map(p => ' ' + p)}`, Destroy)
			.then(selection => {
				const service = editor.document.fileName
				if (selection === Destroy) {
					files[service] = new FileService()
					updateStatus(files[service])
				}
			})
	}

	// 
	// Subscriptions
	// 

	// TODO
	// when lines are added => update fileservice points []
	// when lines are delete => remove from fileservice points []
	// Maybe this
	// context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(() => {}))

	context.subscriptions.push(commands.registerCommand('workpoints.setpoint', SetPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.prevpoint', PrevPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.nextpoint', NextPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.showpoints', ShowPoints))

	// 
	// Functions
	// 

	function movePoint(editor: vscode.TextEditor, service: FileService): void | Thenable<string | undefined> {
		const newPosition = editor.selection.active.with(service.ActivePoint() - 1, 0)
		const newRange = editor.document.lineAt(
			editor.document.lineCount === service.ActivePoint() ? service.ActivePoint() - 1 : service.ActivePoint()
		).range

		editor.selection = new Selection(newPosition, newPosition)
		editor.revealRange(newRange, vscode.TextEditorRevealType.InCenter)
		updateStatus(service)
	}

	function updateStatus(service: FileService): void | Thenable<string | undefined> {
		const points = service.points

		if (points.length > 0) {
			const active = service.ActivePoint()

			if (points.length <= 2) {
				wpStatus.text = ` ( ${active} ) `
				wpStatus.show()
				return
			}

			let prev2 = points[service.active - 2]
			let prev1 = points[service.active - 1]
			let next1 = points[service.active + 1]
			let next2 = points[service.active + 2]

			switch (service.active) {
				case 0:
					prev1 = points[points.length - 1]
					prev2 = points[points.length - 2]
					break;
				case 1:
					prev1 = points[0]
					prev2 = points[points.length - 1]
					break;
				case points.length - 2:
					next1 = points[points.length - 1]
					next2 = points[0]
					break;
				case points.length - 1:
					next1 = points[0]
					next2 = points[1]
					break;
			}

			if (points.length >= 5)
				wpStatus.text = `${prev2} | ${prev1} ( ${active} ) ${next1} | ${next2}`
			else if (points.length >= 3)
				wpStatus.text = `${prev1} ( ${active} ) ${next1}`

			wpStatus.show()
		} else {
			wpStatus.hide()
		}
		// console.log(service)
	}
}

export function deactivate() { }