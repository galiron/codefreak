import useWorkspace from '../../hooks/workspace/useWorkspace'
import { useEffect } from 'react'
import TabPanel from './TabPanel'
import 'xterm/css/xterm.css'
import useStartProcessMutation from '../../hooks/workspace/useStartProcessMutation'
import AbstractProcessTabPanel from './AbstractProcessTabPanel'

const ShellTabPanel = () => {
  const { baseUrl } = useWorkspace()
  const {
    mutate: startProcess,
    data: processId,
    isIdle
  } = useStartProcessMutation()

  useEffect(() => {
    if (!processId && baseUrl.length > 0 && isIdle) {
      startProcess()
    }
  }, [baseUrl, isIdle, processId, startProcess])

  if (!processId) {
    return <TabPanel withPadding loading />
  }

  return <AbstractProcessTabPanel processId={processId} />
}

export default ShellTabPanel
