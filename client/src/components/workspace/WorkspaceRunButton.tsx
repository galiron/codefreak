import { Button } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import useStartProcessMutation from '../../hooks/workspace/useStartProcessMutation'
import { useEffect } from 'react'
import { useMutableQueryParam } from '../../hooks/useQuery'
import {
  RIGHT_TAB_QUERY_PARAM,
  WorkspaceTabType
} from '../../services/workspace'

interface WorkspaceRunButtonProps {
  onRunProcessStarted: (runProcessId: string) => void
}

const WorkspaceRunButton = ({
  onRunProcessStarted
}: WorkspaceRunButtonProps) => {
  const {
    mutate: run,
    isLoading,
    data
  } = useStartProcessMutation(['bash', '-c', 'python main.py'])
  const [activeRightTab, setActiveRightTab] = useMutableQueryParam(
    RIGHT_TAB_QUERY_PARAM,
    ''
  )

  useEffect(() => {
    if (!isLoading && data) {
      onRunProcessStarted(data)
    }
  }, [isLoading, data])

  const handleClick = () => {
    if (!isLoading && !data) {
      run()

      if (activeRightTab !== WorkspaceTabType.CONSOLE) {
        setActiveRightTab(WorkspaceTabType.CONSOLE)
      }
    }
  }

  return (
    <Button
      icon={<CaretRightOutlined />}
      type="primary"
      size="large"
      shape="round"
      loading={isLoading}
      onClick={handleClick}
    >
      Fly, you fools!
    </Button>
  )
}

export default WorkspaceRunButton
