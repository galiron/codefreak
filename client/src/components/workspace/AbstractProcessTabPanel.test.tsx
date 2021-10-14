import { render, waitFor } from '../../services/testing'
import AbstractProcessTabPanel from './AbstractProcessTabPanel'

describe('<AbstractProcessTabPanel />', () => {
  it('renders a terminal when a process-id is given', async () => {
    const workspaceContext = {
      baseUrl: 'https://codefreak.test',
      answerId: '',
      taskId: ''
    }

    const { container } = render(<AbstractProcessTabPanel processId="foo" />, {
      workspaceContext
    })

    await waitFor()

    expect(container.getElementsByClassName('shell-root')).toHaveLength(1)
  })
})
