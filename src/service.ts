import * as vscode from 'vscode';

export default class FileService {
	points: Line[]
	active: number

	constructor() {
		this.points = [];
		this.active = 0;
	}

	ActivePoint(): number {
		return this.points[this.active]
	}

	AddPoint(point: number): void {
		if (this.points.includes(point)) return this.RemovePoint(point)

		this.points.push(point)
		this.points = Array.from(new Set(this.points)).sort((a, b) => a - b)
		vscode.window.showInformationMessage(`Added Line ${point} to Workpoints`)
	}
	RemovePoint(point: number): void {
		this.points = this.points.filter(wp => wp !== point)
		vscode.window.showInformationMessage(`Removed Line ${point} from Workpoints.`)
	}

	DecementActivePoint(): void {
		if (this.active !== 0)
			this.active = this.active -= 1
		else
			this.active = this.points.length - 1
	}
	IncementActivePoint(): void {
		if (this.active !== this.points.length - 1)
			this.active = this.active += 1
		else
			this.active = 0
	}
}
