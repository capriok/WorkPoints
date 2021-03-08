export default class FileService {
	points: Line[]
	active: number

	constructor() {
		this.points = []
		this.active = 0
	}

	ActivePoint(): number {
		return this.points[this.active]
	}

	AddPoint(point: number): void {
		this.points.push(point)
		this.points = Array.from(new Set(this.points)).sort((a, b) => a - b)
	}
	RemovePoint(point: number): void {
		this.points = this.points.filter(wp => wp !== point)
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
