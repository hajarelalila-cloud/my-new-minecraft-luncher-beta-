export interface LogEntry {
  sourceKind: LogEntrySourceKind
  level: LogEntryLevel
  timestamp: number
  logger: string
  thread: string
  message: string
}

export enum LogEntrySourceKind {
  _System = "System",
  _StdOut = "StdOut",
  _StdErr = "StdErr"
}

export enum LogEntryLevel {
  Trace = "Trace",

  Debug = "Debug",

  Info = "Info",

  Warn = "Warn",

  Error = "Error",

  Fatal = "Fatal",

  Unknown = "Unknown"
}
