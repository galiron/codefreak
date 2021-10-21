import Editor, { Monaco } from '@monaco-editor/react'
import TabPanel, { LoadingTabPanelPlaceholder } from './TabPanel'
import useWorkspace from '../../hooks/workspace/useWorkspace'
import { extractRelativeFilePath, readFilePath } from '../../services/workspace'
import { debounce } from 'ts-debounce'
import { editor } from 'monaco-editor'
import { messageService } from '../../services/message'
import useGetWorkspaceFileQuery from '../../hooks/workspace/useGetWorkspaceFileQuery'
import useSaveWorkspaceFileMutation from '../../hooks/workspace/useSaveWorkspaceFileMutation'
import React, { useEffect, useState } from 'react'
import EmptyTabPanel from './EmptyTabPanel'
import { WorkspaceTab, WorkspaceTabType } from '../../services/workspace-tabs'
import { FileTextOutlined } from '@ant-design/icons'

export class EditorWorkspaceTab extends WorkspaceTab {
  constructor(path: string) {
    super(WorkspaceTabType.EDITOR, path)
  }

  renderTitle(): React.ReactNode {
    if (this.path.length > 0) {
      return (
        <>
          <FileTextOutlined /> {this.path}
        </>
      )
    }

    throw new Error('tab is set to type EDITOR but no filePath was given')
  }

  renderContent(): React.ReactNode {
    return <EditorTabPanel file={this.path} />
  }
}

type EditorTabPanelProps = {
  file: string
}

const EditorTabPanel = ({ file }: EditorTabPanelProps) => {
  const { isAvailable, baseUrl } = useWorkspace()
  const { data, isLoading } = useGetWorkspaceFileQuery(file)
  const { mutate: saveFile } = useSaveWorkspaceFileMutation()

  const [fileContents, setFileContents] =
    useState<string | undefined>(undefined)

  useEffect(() => {
    if (data && fileContents === undefined) {
      setFileContents(data)
    }
  }, [data, fileContents])

  const filePath = readFilePath(baseUrl, file)

  // Automatically save changes after 250ms
  const handleChange = debounce(async (contents?: string) => {
    if (contents !== undefined) {
      const path = extractRelativeFilePath(filePath)
      saveFile({ path, contents })
    }
  }, 250)

  const handleEditorDidMount = (
    mountedEditor: editor.IStandaloneCodeEditor,
    mountedMonaco: Monaco
  ) => {
    // People like a green `You're files were saved` when they hit `cmd + s`
    mountedEditor.addAction({
      id: 'save',
      label: 'Save',
      keybindings: [mountedMonaco.KeyMod.CtrlCmd | mountedMonaco.KeyCode.KEY_S],
      run: async ed => {
        const model = ed.getModel()

        if (model) {
          const path = extractRelativeFilePath(model.uri.path)
          const contents = model.getValue()
          saveFile({ path, contents })
          messageService.success(`${path} saved`)
        }
      }
    })
  }

  const loading = !isAvailable || isLoading

  if (file.length === 0) {
    messageService.error('No file path given')
    return <EmptyTabPanel loading={loading} />
  }

  return (
    <TabPanel loading={loading}>
      <Editor
        theme="light"
        value={fileContents}
        path={filePath}
        loading={<LoadingTabPanelPlaceholder />}
        onChange={handleChange}
        onMount={handleEditorDidMount}
      />
    </TabPanel>
  )
}

export default EditorTabPanel
