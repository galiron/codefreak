import {
  act,
  render as originalRender,
  RenderOptions
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import React from 'react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import {
  WorkspaceContext,
  WorkspaceContextType
} from '../hooks/workspace/useWorkspace'

type CustomRenderOptions = {
  queryClient?: QueryClient
  graphqlMocks?: MockedResponse[]
  workspaceContext?: WorkspaceContextType
}

export const render = (
  ui: React.ReactElement,
  options: RenderOptions & CustomRenderOptions = {}
) => {
  const {
    queryClient = new QueryClient(),
    graphqlMocks = [],
    workspaceContext = { baseUrl: '', answerId: '', taskId: '' },
    ...renderOptions
  } = options
  const history = createMemoryHistory()
  return originalRender(
    <Router history={history}>
      <MockedProvider mocks={graphqlMocks} addTypename={false}>
        <QueryClientProvider client={queryClient}>
          <WorkspaceContext.Provider value={workspaceContext}>
            {ui}
          </WorkspaceContext.Provider>
        </QueryClientProvider>
      </MockedProvider>
    </Router>,
    renderOptions
  )
}

export const waitFor = async (ms = 0) =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms))
  })
