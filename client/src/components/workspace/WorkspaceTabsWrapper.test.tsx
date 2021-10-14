import { render, waitFor } from '../../services/testing'
import WorkspaceTabsWrapper from './WorkspaceTabsWrapper'
import { WorkspaceTab, WorkspaceTabType } from '../../services/workspace'

describe('<WorkspaceTabsWrapper />', () => {
  it('renders an <EmptyTabPanel /> when no tabs are given', () => {
    const { container } = render(<WorkspaceTabsWrapper tabs={[]} />)

    expect(container.textContent).toContain('No files open')
  })

  it('renders given tabs', async () => {
    const tabs: WorkspaceTab[] = [{ type: WorkspaceTabType.INSTRUCTIONS }]

    const { container } = render(<WorkspaceTabsWrapper tabs={tabs} />)

    await waitFor()

    expect(
      container.getElementsByClassName('workspace-tab-panel')
    ).toHaveLength(1)
    expect(container.textContent).toContain('Instructions')
  })
})
