import * as vscode from 'vscode'
import { window, commands } from 'vscode'
import { createStatusBarItem } from './create-sbi'
import FileService from './service'

export function activate(context: vscode.ExtensionContext) {

	let files: Files = {}

	const sbi = createStatusBarItem(context)

	context.subscriptions.push(commands.registerCommand('workpoints.setpoint', SetPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.prevpoint', PrevPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.nextpoint', NextPoint))
	context.subscriptions.push(commands.registerCommand('workpoints.showpoints', ShowPoints))

	// TODO
	// when lines are added => update fileservice points []
	// when lines are delete => remove from fileservice points []
	// Maybe this
	// context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(() => {}))

	function SetPoint(): void | Thenable<string | undefined> {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		const cursorPosition = editor.selection.active.line + 1
		const fileName = editor.document.fileName
		let service = files[fileName]

		if (!service) {
			files[fileName] = new FileService()
			service = files[fileName]
		}

		service.points.includes(cursorPosition)
			? service.RemovePoint(cursorPosition)
			: service.AddPoint(cursorPosition)

		if (service.points.length === 0)
			delete files[fileName]

		updateStatus(service)
	}

	function PrevPoint(): void | Thenable<string | undefined> {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		let service = files[editor.document.fileName]
		if (!service || service.points.length === 0)
			return window.showInformationMessage('No workpoints, Add (Ctrl+Shift+/).')

		service.DecementActivePoint()
		movePoint(editor, service)
	}

	function NextPoint(): void | Thenable<string | undefined> {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		let service = files[editor.document.fileName]
		if (!service || service.points.length === 0)
			return window.showInformationMessage('No workpoints, Add (Ctrl+Shift+/).')

		service.IncementActivePoint()
		movePoint(editor, service)
	}

	function ShowPoints(): void | Thenable<string | undefined> {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		const Destroy = 'Destroy workpoints'
		window.showInformationMessage(`Workpoints: ${files[editor.document.fileName].points.map(p => ' ' + p)}`, Destroy)
			.then(selection => {
				const service = editor.document.fileName
				if (selection === Destroy) {
					files[service] = new FileService()
					updateStatus(files[service])
				}
			})
	}

	function movePoint(editor: vscode.TextEditor, service: FileService): void {
		const newPosition = editor.selection.active.with(service.ActivePoint() - 1, 0)
		const newRange = editor.document.lineAt(
			editor.document.lineCount === service.ActivePoint()
				? service.ActivePoint() - 1
				: service.ActivePoint()
		).range

		editor.selection = new vscode.Selection(newPosition, newPosition)
		editor.revealRange(newRange, vscode.TextEditorRevealType.InCenter)
		updateStatus(service)
	}

	function updateStatus(service: FileService): void {
		const points = service.points
		const len = points.length

		if (len > 0) {
			const active = service.ActivePoint()

			let prev2 = points[service.active - 2]
			let prev1 = points[service.active - 1]
			let next1 = points[service.active + 1]
			let next2 = points[service.active + 2]

			if (len === 1) {
				sbi.text = `[ ${active} ]`
				sbi.show()
				return
			}

			switch (service.active) {
				case 0:
					prev1 = points[len - 1]
					prev2 = points[len - 2]
					break;
				case 1:
					prev1 = points[0]
					prev2 = points[len - 1]
					break;
				case len - 2:
					next1 = points[len - 1]
					next2 = points[0]
					break;
				case len - 1:
					next1 = points[0]
					next2 = points[1]
					break;
			}

			if (len === 2) {
				if (service.active === 0) {
					prev1 = points[1]
					next1 = points[1]
				}
				else {
					prev1 = points[0]
					next1 = points[0]
				}
			}

			len >= 5
				? sbi.text = `[ ${prev2} [ ${prev1} [ ${active} ] ${next1} ] ${next2} ]`
				: sbi.text = `[ ${prev1} [ ${active} ] ${next1} ]`

			sbi.show()
		} else {
			sbi.hide()
		}
	}
}

export function deactivate() { }