import useWorkspace from '../../hooks/workspace/useWorkspace'
import TabPanel from './TabPanel'
import AbstractProcessTabPanel from './AbstractProcessTabPanel'

const ConsoleTabPanel = () => {
  const { runProcessId } = useWorkspace()

  if (!runProcessId) {
    return <TabPanel withPadding loading />
  }

  return <AbstractProcessTabPanel processId={runProcessId} />
}

export default ConsoleTabPanel
