export enum WorkspaceTabType {
  EDITOR = 'editor',
  EMPTY = 'empty',
  INSTRUCTIONS = 'instructions',
  SHELL = 'shell',
  CONSOLE = 'console',
  EVALUATION = 'evaluation'
}

export type WorkspaceTab = {
  type: WorkspaceTabType
  path?: string
}

const FILES_API_ROUTE = 'files'
const GRAPHQL_API_ROUTE = 'graphql'
const PROCESS_API_ROUTE = 'process'
export const WRITE_FILE_FORM_KEY = 'files'
export const LEFT_TAB_QUERY_PARAM = 'leftTab'
export const RIGHT_TAB_QUERY_PARAM = 'rightTab'

export const extractRelativeFilePath = (path: string) => {
  const pattern = `/${FILES_API_ROUTE}/`
  const index = path.indexOf(pattern)

  // index === 0 when no base-url is given
  if (index <= 0) {
    throw new Error('Invalid file path pattern')
  }

  return path.substr(index + pattern.length)
}

export const writeFilePath = (baseUrl: string) => {
  const separator = baseUrl.endsWith('/') ? '' : '/'
  return `${baseUrl}${separator}${FILES_API_ROUTE}`
}

export const withTrailingSlash = (path: string) => {
  const trimmedPath = path.trim()
  return trimmedPath.endsWith('/') ? trimmedPath : `${trimmedPath}/`
}

export const readFilePath = (baseUrl: string, filePath: string) => {
  const filePathSeparator = filePath.startsWith('/') ? '' : '/'
  const normalizedBaseUrl = withTrailingSlash(baseUrl)
  return `${normalizedBaseUrl}${FILES_API_ROUTE}${filePathSeparator}${filePath}`
}

export const httpToWs = (url: string) => {
  if (!url.includes('http')) {
    throw new Error('The url does not contain http')
  }

  return url.replace('http', 'ws')
}

export const graphqlWebSocketPath = (baseUrl: string) => {
  const normalizedBaseUrl = withTrailingSlash(baseUrl)
  return httpToWs(`${normalizedBaseUrl}${GRAPHQL_API_ROUTE}`)
}

export const processWebSocketPath = (baseUrl: string, processId: string) => {
  const normalizedBaseUrl = withTrailingSlash(baseUrl)

  if (processId.length === 0) {
    throw new Error('No valid process-id was given')
  }

  return httpToWs(`${normalizedBaseUrl}${PROCESS_API_ROUTE}/${processId}`)
}

export const removeEditorTab = (path: string, tabs: WorkspaceTab[]) =>
  tabs.filter(tab => tab.type !== WorkspaceTabType.EDITOR || tab.path !== path)

export const indexOf = (tabs: WorkspaceTab[], searchTab: WorkspaceTab) => {
  let tabIndex = -1
  tabs.forEach((tab, index) => {
    if (tab.type === searchTab.type && tab.path === searchTab.path) {
      tabIndex = index
    }
  })
  return tabIndex
}

export const toActiveTabQueryParam = (tab: WorkspaceTab) =>
  tab.type === WorkspaceTabType.EDITOR
    ? tab.path ?? WorkspaceTabType.EMPTY
    : tab.type

class WorkspaceTabFactoryClass {
  EditorTab(path: string): WorkspaceTab {
    return {
      type: WorkspaceTabType.EDITOR,
      path
    }
  }

  InstructionsTab(): WorkspaceTab {
    return { type: WorkspaceTabType.INSTRUCTIONS }
  }

  ShellTab(): WorkspaceTab {
    return { type: WorkspaceTabType.SHELL }
  }

  ConsoleTab(): WorkspaceTab {
    return { type: WorkspaceTabType.CONSOLE }
  }

  EvaluationTab(): WorkspaceTab {
    return { type: WorkspaceTabType.EVALUATION }
  }

  EmptyTab(): WorkspaceTab {
    return { type: WorkspaceTabType.EMPTY }
  }
}

export const WorkspaceTabFactory = new WorkspaceTabFactoryClass()
