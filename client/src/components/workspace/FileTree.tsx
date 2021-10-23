import { Dropdown, Modal, Tree, TreeProps } from 'antd'
import { DataNode, EventDataNode } from 'antd/lib/tree'
import useListWorkspaceFilesQuery, {
  FileSystemNode,
  listFiles
} from '../../hooks/workspace/useListWorkspaceFilesQuery'
import { useEffect, useState } from 'react'
import useWorkspace from '../../hooks/workspace/useWorkspace'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { dirname } from 'path'
import useCreateWorkspacePathMutation, {
  PathType
} from '../../hooks/workspace/useCreateWorkspacePathMutation'
import { trimLeadingSlashes, withTrailingSlash } from '../../services/strings'
import useDeleteWorkspacePathMutation from '../../hooks/workspace/useDeleteWorkspacePathMutation'
import { WorkspaceTab, WorkspaceTabType } from '../../services/workspace-tabs'
import FileTreeRightClickMenu from './FileTreeRightClickMenu'
import {
  getParentPathForNameInput,
  openNameInput,
  TREE_INPUT_KEY
} from './FileTreeNameInput'

const { DirectoryTree } = Tree
const { confirm } = Modal

/**
 * // TODO move to services
 * Converts a FileSystemNode to a DataNode
 *
 * @param fileSystemNode the node to convert
 */
export const toDataNode = (fileSystemNode: FileSystemNode): DataNode => ({
  title: fileSystemNode.path.substring(
    fileSystemNode.path.lastIndexOf('/') + 1
  ),
  key: fileSystemNode.path,
  isLeaf: fileSystemNode.size !== undefined ? true : undefined
})

/**
 * // TODO move to services
 * Combines newly loaded DataNodes with their previous data so that their loaded children are not lost when updated.
 *
 * Example:
 * The nodes in path `/foo` were loaded previously and their children were loaded too.
 * When re-loading the nodes in `/foo` the loaded nodes have no children (since the loading is only one level)
 * and the already loaded children would be overwritten by `undefined`.
 * includeExistingChildrenToNewlyLoadedDataNodes([...newNodes], [...oldNodes]) adds the children to the corresponding
 * newly loaded nodes.
 *
 * @param newlyLoadedNodes the DataNodes that were loaded (all with a common parent-path)
 * @param existingNodes the DataNodes that were previously loaded for the common parent-path
 */
export const includeExistingChildrenToNewlyLoadedDataNodes = (
  newlyLoadedNodes: DataNode[],
  existingNodes: DataNode[] = []
) =>
  newlyLoadedNodes.map(node => {
    const children = existingNodes.find(
      existingNode => existingNode.key === node.key
    )?.children

    return children
      ? {
          ...node,
          children
        }
      : node
  })

/**
 * // TODO move to services
 * //TODO what if the path does not exists yet?
 * Recursively inserts new nodes into an existing tree of DataNodes at a given parent-path. If some of the new nodes already existed in the
 * old tree their children are kept and added to the corresponding new nodes.
 *
 * @param path the path were the new nodes are to be inserted as children
 * @param existingNodes the existing nodes to insert into
 * @param newNodes the nodes to be inserted
 */
export const insertDataNodes = (
  path: string,
  existingNodes: DataNode[],
  newNodes: DataNode[]
): DataNode[] =>
  existingNodes.map(node => {
    if (node.key === path) {
      // Don't overwrite existing children of the nodes
      return {
        ...node,
        children: includeExistingChildrenToNewlyLoadedDataNodes(
          newNodes,
          node.children
        )
      }
    } else if (node.children !== undefined) {
      // Search in the children of the node for the correct path
      return {
        ...node,
        children: insertDataNodes(path, node.children, newNodes)
      }
    }

    return node
  })

/**
 * // TODO move to services
 * Returns whether the given path can be interpreted as the root-directory '/'
 *
 * @param path the path
 */
export const isRoot = (path: string) => path === '/' || path === ''

/**
 * // TODO move to services
 * Finds a DataNode in a tree of nodes by the given path
 *
 * @param nodes the nodes to search in
 * @param path the path of the node to find
 */
export const findNode = (
  nodes: DataNode[],
  path: string
): DataNode | undefined =>
  nodes.find(node => {
    if (!path.includes(node.key.toString())) {
      return false
    }

    if (path === node.key.toString()) {
      return true
    }

    return node.children ? findNode(node.children, path) : false
  })

/**
 * Represents an item in the FileTree that was right-clicked
 */
export type RightClickedItem = {
  /**
   * The path of the right-clicked item
   */
  path: string
  /**
   * Whether the right-clicked item is a file
   */
  isFile: boolean
}

/**
 * Offers a callback when a file-entry in the tree is opened
 */
interface FileTreeProps {
  /**
   * A callback when a file-entry in the tree is opened
   *
   * @param path the path of the opened file
   */
  onOpenFile: (path: string) => void
}

/**
 * Renders the files and directories of the workspace in a tree format
 */
const FileTree = ({ onOpenFile }: FileTreeProps) => {
  const { graphqlWebSocketClient } = useWorkspace()
  const { data } = useListWorkspaceFilesQuery()
  const { mutate: createPath } = useCreateWorkspacePathMutation()
  const { mutate: deletePath } = useDeleteWorkspacePathMutation()
  const [treeData, setTreeData] = useState<DataNode[]>()
  const [rightClickedItem, setRightClickedItem] = useState<RightClickedItem>()
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  useEffect(() => {
    if (!treeData && data) {
      const loadedData = data.map(toDataNode)
      setTreeData(loadedData)
    }
  }, [data, treeData])

  /**
   * // TODO extract into helper-method?
   * Loads the DataNodes for the given path and updates the treeData with them.
   *
   * @param path the path to load node for
   */
  const loadData = async (path: string) => {
    if (!graphqlWebSocketClient) {
      return Promise.reject('No graphql websocket client found')
    }

    const treeNodes = await listFiles(path, graphqlWebSocketClient)

    const convertedNodes = treeNodes.map(toDataNode)

    setTreeData(prevState =>
      isRoot(path)
        ? includeExistingChildrenToNewlyLoadedDataNodes(
            convertedNodes,
            prevState
          )
        : insertDataNodes(path, prevState ?? [], convertedNodes)
    )
  }

  /**
   * Loads the DataNodes for the path in the given EventDataNode and updates the treeData with them.
   *
   * @param treeNode the node to load data for
   */
  const loadDataFromTreeNode = (treeNode: EventDataNode) =>
    loadData(treeNode.key.toString())

  /**
   * Opens the node if it is a file
   *
   * @param _
   * @param node the node that was selected
   */
  const openIfFile: TreeProps['onSelect'] = (_, { node }) => {
    if (node.isLeaf && node.key !== TREE_INPUT_KEY) {
      onOpenFile(node.key.toString())
    }
  }

  const renameRightClickedItem = () => {
    if (!rightClickedItem) {
      return
    }

    // TODO open name-input in path
    // TODO rename file with name from input
    // TODO inside rename (for now): Error("Not implemented yet")
    // TODO error when name already exists
    throw new Error('Unsupported operation')
  }

  const deleteRightClickedItem = () => {
    if (!rightClickedItem) {
      return
    }

    const path = rightClickedItem.path
    const parentPath = dirname(path)

    confirm({
      title: `Are you sure you want to delete '${trimLeadingSlashes(path)}'?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Delete',
      okType: 'danger',
      onOk() {
        deletePath({ path }, { onSuccess: () => loadData(parentPath) })
      }
    })
  }

  const openNameInputForType = (type: PathType) => () => {
    const parentPath = getParentPathForNameInput(rightClickedItem)

    const handleConfirm = (fileName: string) => {
      const path = withTrailingSlash(parentPath) + trimLeadingSlashes(fileName)

      createPath(
        { path, type },
        {
          onSuccess: () => loadData(parentPath)
        }
      )
    }

    const handleCancel = () => loadData(parentPath)

    const expandPath = async () => {
      // TODO track an added state
      // if index === -1 => add expanded key and load data
      // if index !== -1 => add input to tree data
      if (expandedKeys.indexOf(parentPath) === -1) {
        await loadData(parentPath)
        setExpandedKeys(prevState => [parentPath, ...prevState])
      }
    }

    openNameInput(
      handleConfirm,
      handleCancel,
      expandPath,
      setTreeData,
      type,
      treeData,
      rightClickedItem
    )
  }

  const rightClickMenu = (
    <FileTreeRightClickMenu
      rightClickedItem={rightClickedItem}
      onRename={renameRightClickedItem}
      onDelete={deleteRightClickedItem}
      onAddFile={openNameInputForType(PathType.FILE)}
      onAddDirectory={openNameInputForType(PathType.DIRECTORY)}
    />
  )

  const handleRightClick: TreeProps['onRightClick'] = ({ node }) => {
    setRightClickedItem({
      path: node.key.toString(),
      isFile: node.isLeaf ?? false
    })
  }

  // Manage the expanded keys manually so we can expand directories if new nodes are created inside it
  const handleExpand: TreeProps['onExpand'] = newExpandedKeys => {
    setExpandedKeys([...newExpandedKeys.map(e => e.toString())])
  }

  return (
    <Dropdown overlay={rightClickMenu} trigger={['contextMenu']}>
      <div
        style={{ height: '100%', width: '100%' }}
        className="workspace-file-tree"
      >
        <DirectoryTree
          treeData={treeData}
          loadData={loadDataFromTreeNode}
          onSelect={openIfFile}
          onRightClick={handleRightClick}
          expandedKeys={expandedKeys}
          onExpand={handleExpand}
        />
      </div>
    </Dropdown>
  )
}

/**
 * Represents a WorkspaceTab that renders the files of a workspace in a FileTree.
 * A callback is needed for when a file is opened through the tree.
 *
 * @constructor
 */
export class FileTreeWorkspaceTab extends WorkspaceTab {
  private onOpenFile: FileTreeProps['onOpenFile']

  constructor(onOpenFile: FileTreeProps['onOpenFile']) {
    super(WorkspaceTabType.FILE_TREE, '')
    this.onOpenFile = onOpenFile
  }

  renderTitle() {
    return 'Files'
  }

  renderContent() {
    return <FileTree onOpenFile={this.onOpenFile} />
  }
}

export default FileTree
