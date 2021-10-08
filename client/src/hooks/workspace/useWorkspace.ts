import { createContext, useContext } from 'react'
import { useQuery } from 'react-query'
import { Client } from 'graphql-ws'

export type WorkspaceContextType = {
  baseUrl: string
  taskId: string
  answerId: string
  graphqlWebSocketClient?: Client
  runProcessId?: string
}

const initialWorkspaceContext: WorkspaceContextType = {
  baseUrl: '',
  answerId: '',
  taskId: ''
}

export const WorkspaceContext = createContext<WorkspaceContextType>(
  initialWorkspaceContext
)

const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  const { data } = useQuery(
    'isWorkspaceAvailable',
    () => fetch(context.baseUrl).then(() => Promise.resolve(true)),
    {
      enabled: context.baseUrl.length > 0,
      retry: true
    }
  )

  const isAvailable = data !== undefined && data

  return {
    isAvailable,
    ...context
  }
}

export default useWorkspace
