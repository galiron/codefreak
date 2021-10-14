import {
  extractRelativeFilePath,
  graphqlWebSocketPath,
  httpToWs,
  indexOf,
  processWebSocketPath,
  readFilePath,
  removeEditorTab,
  toActiveTabQueryParam,
  withTrailingSlash,
  WorkspaceTab,
  WorkspaceTabFactory,
  WorkspaceTabType,
  writeFilePath
} from './workspace'

test('extractRelativeFilePath', () => {
  new Map([
    ['https://codefreak.test/files/foo.txt', 'foo.txt'],
    ['https://codefreak.test/files/bar/foo.txt', 'bar/foo.txt'],
    ['https://codefreak.test/files/', ''],
    ['https://codefreak.test/foo.txt', null],
    ['/files/foo.txt', null],
    ['foo.txt', null],
    ['', null]
  ]).forEach((expected, input) => {
    if (expected === null) {
      // TODO custom error types
      expect(() => extractRelativeFilePath(input)).toThrow()
    } else {
      expect(extractRelativeFilePath(input)).toBe(expected)
    }
  })
})

test('writeFilePath', () => {
  new Map([
    ['https://codefreak.test/', 'https://codefreak.test/files'],
    ['https://codefreak.test', 'https://codefreak.test/files']
  ]).forEach((expected, input) => {
    expect(writeFilePath(input)).toBe(expected)
  })
})

test('withTrailingSlash', () => {
  new Map([
    ['https://codefreak.test/', 'https://codefreak.test/'],
    ['https://codefreak.test', 'https://codefreak.test/'],
    ['', '/'],
    ['/', '/']
  ]).forEach((expected, input) => {
    expect(withTrailingSlash(input)).toBe(expected)
  })
})

test('readFilePath', () => {
  new Map([
    ['foo.txt', 'https://codefreak.test/files/foo.txt'],
    ['bar/foo.txt', 'https://codefreak.test/files/bar/foo.txt'],
    ['/foo.txt', 'https://codefreak.test/files/foo.txt'],
    ['/bar/foo.txt', 'https://codefreak.test/files/bar/foo.txt'],
    ['', 'https://codefreak.test/files/'],
    ['/', 'https://codefreak.test/files/']
  ]).forEach((expected, input) => {
    expect(readFilePath('https://codefreak.test', input)).toBe(expected)
  })
})

test('httpToWs', () => {
  new Map([
    ['http://codefreak.test', 'ws://codefreak.test'],
    ['https://codefreak.test', 'wss://codefreak.test'],
    ['', null],
    ['file:///home/codefreak/foo.txt', null]
  ]).forEach((expected, input) => {
    if (expected === null) {
      // TODO custom error types
      expect(() => httpToWs(input)).toThrow()
    } else {
      expect(httpToWs(input)).toBe(expected)
    }
  })
})

test('graphqlWebSocketPath', () => {
  new Map([
    ['http://codefreak.test', 'ws://codefreak.test/graphql'],
    ['https://codefreak.test', 'wss://codefreak.test/graphql'],
    ['', null],
    ['foo', null]
  ]).forEach((expected, input) => {
    if (expected === null) {
      // TODO custom error types
      expect(() => graphqlWebSocketPath(input)).toThrow()
    } else {
      expect(graphqlWebSocketPath(input)).toBe(expected)
    }
  })
})

test('processWebSocketPath', () => {
  new Map([
    [
      '00000000-0000-0000-0000-000000000000',
      'wss://codefreak.test/process/00000000-0000-0000-0000-000000000000'
    ],
    ['', null]
  ]).forEach((expected, input) => {
    if (expected === null) {
      // TODO custom error types
      expect(() =>
        processWebSocketPath('https://codefreak.test', input)
      ).toThrow()
    } else {
      expect(processWebSocketPath('https://codefreak.test', input)).toBe(
        expected
      )
    }
  })
})

test('removeEditorTab', () => {
  const tabToRemove = { type: WorkspaceTabType.EDITOR, path: 'foo.txt' }
  const withoutTab: WorkspaceTab[] = [{ type: WorkspaceTabType.INSTRUCTIONS }]
  const withTab: WorkspaceTab[] = [tabToRemove, ...withoutTab]
  const withTabButNotEditor: WorkspaceTab[] = [
    ...withoutTab,
    { type: WorkspaceTabType.SHELL, path: 'foo.txt' }
  ]

  expect(removeEditorTab('foo.txt', withoutTab)).toStrictEqual(withoutTab)
  expect(removeEditorTab('foo.txt', withTab)).toStrictEqual(withoutTab)
  expect(removeEditorTab('foo.txt', withTabButNotEditor)).toStrictEqual(
    withTabButNotEditor
  )
})

test('indexOf', () => {
  const tab = { type: WorkspaceTabType.EDITOR, path: 'foo.txt' }
  const withoutTab: WorkspaceTab[] = [{ type: WorkspaceTabType.INSTRUCTIONS }]
  const withTab: WorkspaceTab[] = [tab, ...withoutTab]

  expect(indexOf(withTab, tab)).toBe(0)
  expect(indexOf(withoutTab, tab)).toBe(-1)
})

test('toActiveTabQueryParam', () => {
  new Map([
    [{ type: WorkspaceTabType.EDITOR, path: 'foo.txt' }, 'foo.txt'],
    [{ type: WorkspaceTabType.EDITOR }, WorkspaceTabType.EMPTY],
    [{ type: WorkspaceTabType.EMPTY }, WorkspaceTabType.EMPTY],
    [{ type: WorkspaceTabType.INSTRUCTIONS }, WorkspaceTabType.INSTRUCTIONS],
    [{ type: WorkspaceTabType.SHELL }, WorkspaceTabType.SHELL],
    [{ type: WorkspaceTabType.CONSOLE }, WorkspaceTabType.CONSOLE],
    [{ type: WorkspaceTabType.EVALUATION }, WorkspaceTabType.EVALUATION]
  ]).forEach((expected, input) => {
    expect(toActiveTabQueryParam(input)).toBe(expected)
  })
})

test('WorkspaceTabFactory', () => {
  new Map([
    [
      WorkspaceTabFactory.EditorTab('foo.txt'),
      { type: WorkspaceTabType.EDITOR, path: 'foo.txt' }
    ],
    [WorkspaceTabFactory.EmptyTab(), { type: WorkspaceTabType.EMPTY }],
    [
      WorkspaceTabFactory.InstructionsTab(),
      { type: WorkspaceTabType.INSTRUCTIONS }
    ],
    [WorkspaceTabFactory.ShellTab(), { type: WorkspaceTabType.SHELL }],
    [WorkspaceTabFactory.ConsoleTab(), { type: WorkspaceTabType.CONSOLE }],
    [WorkspaceTabFactory.EvaluationTab(), { type: WorkspaceTabType.EVALUATION }]
  ]).forEach((expected, input) => {
    expect(input).toStrictEqual(expected)
  })
})
