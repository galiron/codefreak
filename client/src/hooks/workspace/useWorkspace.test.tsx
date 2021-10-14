import { renderHook } from '@testing-library/react-hooks'
import useWorkspace, { WorkspaceContext } from './useWorkspace'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

describe('useWorkspace()', () => {
  it('checks whether the workspace is available and returns the workspace-context', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => {
      const response = new Response()
      return Promise.resolve(response)
    })

    const baseUrl = 'https://codefreak.test'

    const wrapper = ({ children }: React.PropsWithChildren<unknown>) => (
      <QueryClientProvider client={new QueryClient()}>
        <WorkspaceContext.Provider
          value={{
            baseUrl,
            answerId: 'answerId',
            taskId: 'taskId',
            runProcessId: 'runProcessId'
          }}
        >
          {children}
        </WorkspaceContext.Provider>
      </QueryClientProvider>
    )

    const { result, waitForValueToChange } = renderHook(() => useWorkspace(), {
      wrapper
    })

    await waitForValueToChange(() => result.current.isAvailable)

    expect(fetchMock).toHaveBeenCalledWith(baseUrl)
    expect(result.current.isAvailable).toBe(true)
    expect(result.current.baseUrl).toStrictEqual(baseUrl)
    expect(result.current.answerId).toStrictEqual('answerId')
    expect(result.current.taskId).toStrictEqual('taskId')
    expect(result.current.runProcessId).toStrictEqual('runProcessId')
  })
})
