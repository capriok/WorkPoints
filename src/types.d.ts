interface Files {
	[key: string]: FileService
}

interface FileService {
	points: Line[]
	active: number
	ActivePoint: () => number
	AddPoint: (workPoint: number) => void
	RemovePoint: (workPoint: number) => void
	DecementActivePoint: () => void
	IncementActivePoint: () => void
}

type Line = number