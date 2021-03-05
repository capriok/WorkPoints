type Line = number

interface Files {
	[key: string]: FileService
}

interface FileService {
	points: Line[]
	active: number
	GetActive: () => number
	AddWorkPoint: (workPoint: number) => void
	RemWorkPoint: (workPoint: number) => void
	DecementActiveWorkPoint: () => void
	IncementActiveWorkPoint: () => void
}
