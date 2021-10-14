import { render, waitFor } from '../../services/testing'
import WorkspacePage from './WorkspacePage'
import {
  FileContextType,
  StartWorkspaceDocument
} from '../../services/codefreak-api'
import { noop } from '../../services/util'
import { MockedResponse } from '@apollo/client/testing'

const startWorkspaceMock: (
  onResult: () => void,
  baseUrl: string,
  answerId: string
) => MockedResponse = (
  onResult: () => void,
  baseUrl: string,
  answerId: string
) => ({
  request: {
    query: StartWorkspaceDocument,
    variables: {
      context: {
        id: answerId,
        type: FileContextType.Answer
      }
    }
  },
  result: () => {
    onResult()
    return {
      data: {
        startWorkspace: {
          baseUrl
        }
      }
    }
  }
})

const answerId = 'foo'
const baseUrl = 'https://codefreak.test'

describe('<WorkspacePage />', () => {
  it('renders two <WorkspaceTabsWrapper /> and a <FileTree />', () => {
    const workspaceContext = { baseUrl, answerId, taskId: '' }

    const mocks = [startWorkspaceMock(noop, baseUrl, answerId)]

    const { container } = render(
      <WorkspacePage onBaseUrlChange={noop} type={FileContextType.Answer} />,
      { workspaceContext, graphqlMocks: mocks }
    )

    expect(
      container.getElementsByClassName('workspace-tabs-wrapper')
    ).toHaveLength(2)
    expect(
      container.getElementsByClassName('workspace-file-tree')
    ).toHaveLength(1)
  })

  it('starts a workspace and the correct baseUrl is set', async () => {
    let wasStartWorkspaceCalled = false
    let baseUrlFromProvider = ''

    const workspaceContext = {
      baseUrl: baseUrlFromProvider,
      answerId,
      taskId: ''
    }

    const mocks = [
      startWorkspaceMock(
        () => (wasStartWorkspaceCalled = true),
        baseUrl,
        answerId
      )
    ]

    render(
      <WorkspacePage
        onBaseUrlChange={newBaseUrl => (baseUrlFromProvider = newBaseUrl)}
        type={FileContextType.Answer}
      />,
      { workspaceContext, graphqlMocks: mocks }
    )

    await waitFor()

    expect(wasStartWorkspaceCalled).toBe(true)
    expect(baseUrlFromProvider).toBe(baseUrl)
  })
})
