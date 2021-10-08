import useWorkspace from './useWorkspace'
import { useMutation } from 'react-query'

const START_PROCESS = (commands: string[]) => {
  const cmd = commands.length !== 0 ? '["' + commands.join('","') + '"]' : '[]'

  return `
mutation StartProcess {
  startProcess(cmd: ${cmd}) {
    id
  }
}
`
}

type StartProcessMutation = {
  startProcess: {
    id: string
  }
}

const useStartProcessMutation = (commands = ['bash']) => {
  const { graphqlWebSocketClient, baseUrl } = useWorkspace()

  return useMutation(
    ['workspace-start-process', baseUrl, commands.join('","')],
    () =>
      new Promise<string>((resolve, reject) => {
        let processId: string | undefined

        if (!graphqlWebSocketClient) {
          reject('GraphQL WebSocket client is not ready yet')
          return
        }

        graphqlWebSocketClient.subscribe<StartProcessMutation>(
          { query: START_PROCESS(commands) },
          {
            next: data => (processId = data.data?.startProcess.id),
            error: reject,
            complete: () => {
              if (!processId) {
                return reject('No process id was returned')
              }
              return resolve(processId)
            }
          }
        )
      })
  )
}

export default useStartProcessMutation
