import {
	window, commands, ExtensionContext, StatusBarItem,
	StatusBarAlignment, TextEditor, Selection, TextEditorRevealType
} from 'vscode'
import FileService from './service'
let wpStatus: StatusBarItem

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "workpoints" is now active!')

	let files: Files = {}

	wpStatus = window.createStatusBarItem(StatusBarAlignment.Right, 1000)
	wpStatus.command = 'workpoints.showpoints'
	context.subscriptions.push(wpStatus)

	// TODO
	// when lines are added => update fileservice points []
	// when lines are delete => remove from fileservice points []


	context.subscriptions.push(
		commands.registerCommand('workpoints.setpoint', () => {
			const editor = window.activeTextEditor
			if (!editor) return window.showInformationMessage('Editor Not Found.')

			const cursorPosition = editor.selection.active.line + 1
			const fileName = editor.document.fileName
			let currentService = files[fileName]

			if (!currentService) {
				files[fileName] = new FileService()
				currentService = files[fileName]
				console.log(files)
			}

			currentService.AddPoint(cursorPosition)
			console.log(currentService)

			if (currentService.points.length === 0)
				delete files[fileName]

			updateStatus(currentService)
		})
	)

	context.subscriptions.push(
		commands.registerCommand('workpoints.prevpoint', () => {
			const editor = window.activeTextEditor
			if (!editor) return window.showInformationMessage('_Editor Not Found.')

			let currentService = files[editor.document.fileName]
			if (!currentService || currentService.points.length === 0)
				return window.showInformationMessage('No WorkPoints, Add (Ctrl+Shift+/).')

			currentService.DecementActivePoint()
			movePoint(editor, currentService)
			updateStatus(currentService)
		})
	)

	context.subscriptions.push(
		commands.registerCommand('workpoints.nextpoint', () => {
			const editor = window.activeTextEditor
			if (!editor) return window.showInformationMessage('_Editor Not Found.')

			let currentService = files[editor.document.fileName]
			if (!currentService || currentService.points.length === 0)
				return window.showInformationMessage('No WorkPoints, Add (Ctrl+Shift+/).')

			currentService.IncementActivePoint()
			movePoint(editor, currentService)
			updateStatus(currentService)
		})
	)

	function movePoint(editor: TextEditor, currentService: FileService): void | Thenable<string | undefined> {
		const newPosition = editor.selection.active.with(currentService.ActivePoint() - 1, 0)
		const newRange = editor.document.lineAt(currentService.ActivePoint()).range

		editor.selection = new Selection(newPosition, newPosition)
		editor.revealRange(newRange, TextEditorRevealType.InCenter)
		console.log(currentService)
	}

	context.subscriptions.push(commands.registerCommand('workpoints.showpoints', () => {
		const editor = window.activeTextEditor
		if (!editor) return window.showInformationMessage('Editor Not Found.')

		window.showInformationMessage(`WorkPoints: ${files[editor.document.fileName].points.map(p => ' ' + p)}`)
	}))

	function updateStatus(currentService: FileService): void | Thenable<string | undefined> {
		const points = currentService.points

		if (points.length > 0) {
			const active = currentService.ActivePoint()
			let status = ` ( ${active} ) `
			let prev2 = points[currentService.active - 2]
			let prev1 = points[currentService.active - 1]
			let next1 = points[currentService.active + 1]
			let next2 = points[currentService.active + 2]

			if (points.length >= 3) {
				if (currentService.active === 0) {
					prev1 = points[points.length - 1]
				} else if (currentService.active === points.length - 1) {
					next1 = points[0]
				}
				status = `${prev1} ( ${active} ) ${next1}`
			}

			if (points.length >= 5) {
				if (currentService.active === 0) {
					prev1 = points[points.length - 1]
					prev2 = points[points.length - 2]
				} else if (currentService.active === 1) {
					prev1 = points[0]
					prev2 = points[points.length - 1]
				} else if (currentService.active === points.length - 2) {
					next1 = points[points.length - 1]
					next2 = points[0]
				} else if (currentService.active === points.length - 1) {
					next1 = points[0]
					next2 = points[1]
				}
				status = `${prev2} | ${prev1} ( ${active} ) ${next1} | ${next2}`
			}

			wpStatus.text = status
			wpStatus.show()
		} else {
			wpStatus.text = 'No WorkPoints'
			wpStatus.hide()
		}
	}
}

export function deactivate() { }
