import * as vscode from 'vscode';

export default class FileService {
	points: Line[]
	active: number

	constructor() {
		this.points = [];
		this.active = 0;
	}

	GetActive(): number {
		return this.points[this.active]
	}

	AddWorkPoint(point: number): void {
		if (this.points.includes(point)) return this.RemWorkPoint(point)

		this.points.push(point)
		this.points = Array.from(new Set(this.points)).sort((a, b) => a - b)
	}
	RemWorkPoint(point: number): void {
		vscode.window.showInformationMessage(`Removed Line ${point} from Workpoints.`)
		this.points = this.points.filter(wp => wp !== point)
	}

	DecementActiveWorkPoint(): void {
		if (this.active !== 0)
			this.active = this.active -= 1
		else
			this.active = this.points.length - 1
	}
	IncementActiveWorkPoint(): void {
		if (this.active !== this.points.length - 1)
			this.active = this.active += 1
		else
			this.active = 0
	}
}
