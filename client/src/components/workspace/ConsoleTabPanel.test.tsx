import { render, waitFor } from '../../services/testing'
import ConsoleTabPanel from './ConsoleTabPanel'

describe('<ConsoleTabPanel />', () => {
  it('renders a placeholder when no process-id is given', async () => {
    const { container } = render(<ConsoleTabPanel />)

    await waitFor()

    expect(
      container.getElementsByClassName('workspace-tab-panel-placeholder')
    ).toHaveLength(1)
  })

  it('renders a terminal when a process-id is given', async () => {
    const workspaceContext = {
      baseUrl: 'https://codefreak.test',
      answerId: '',
      taskId: '',
      runProcessId: 'foo'
    }

    const { container } = render(<ConsoleTabPanel />, { workspaceContext })

    await waitFor()

    expect(container.getElementsByClassName('shell-root')).toHaveLength(1)
  })
})
