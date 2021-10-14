import { createClient } from 'graphql-ws'
import { render, waitFor } from '../../services/testing'
import ShellTabPanel from './ShellTabPanel'
import { httpToWs } from '../../services/workspace'

const baseUrl = 'https://codefreak.test'

describe('<ShellTabPanel />', () => {
  it('starts a process when rendered', async () => {
    let wasConnecting = false

    const graphqlWebSocketClient = createClient({ url: httpToWs(baseUrl) })
    graphqlWebSocketClient.on('connecting', () => {
      wasConnecting = true
    })

    render(<ShellTabPanel />, {
      workspaceContext: {
        baseUrl,
        answerId: '',
        taskId: '',
        graphqlWebSocketClient
      }
    })

    await waitFor()

    expect(wasConnecting).toBe(true)
  })
})
