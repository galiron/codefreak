import { FileAddOutlined, FolderAddOutlined } from '@ant-design/icons'
import { Input, InputProps } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { dirname } from 'path'
import { KeyboardEventHandler } from 'react'
import { PathType } from '../../hooks/workspace/useCreateWorkspacePathMutation'
import { noop } from '../../services/util'
import { findNode, insertDataNodes, isRoot, RightClickedItem } from './FileTree'

/**
 * Unique key for file-name inputs in the file-tree
 */
export const TREE_INPUT_KEY = '\0'

/**
 * // TODO document
 * @param rightClickedItem
 * @returns
 */
export const getParentPathForNameInput = (
  rightClickedItem?: RightClickedItem
) => {
  if (rightClickedItem === undefined) {
    return '/'
  } else {
    return rightClickedItem.isFile
      ? dirname(rightClickedItem.path)
      : rightClickedItem.path
  }
}

/**
 * // TODO document
 * @param type
 * @returns
 */
const getIconForPathType = (type: PathType) => {
  switch (type) {
    case PathType.FILE:
      return <FileAddOutlined />
    case PathType.DIRECTORY:
      return <FolderAddOutlined />
  }
}

/**
 * // TODO document
 * @param onConfirm
 * @param onCancel
 * @param type
 * @returns
 */
const createNameInputNode = (
  onConfirm: (name: string) => void,
  onCancel: () => void,
  type: PathType
): DataNode => {
  return {
    key: TREE_INPUT_KEY,
    title: <FileTreeNameInput onConfirm={onConfirm} onCancel={onCancel} />,
    icon: getIconForPathType(type),
    isLeaf: type === PathType.FILE
  }
}

/**
 * // TODO document
 * @param treeData
 * @param nameInputNode
 * @param parentPath
 * @returns
 */
const insertNameInputNodeIntoTree = (
  treeData: DataNode[],
  nameInputNode: DataNode,
  parentPath: string
): DataNode[] => {
  const parentNode = findNode(treeData, parentPath)

  return isRoot(parentPath)
    ? [nameInputNode, ...treeData]
    : insertDataNodes(parentPath, treeData, [
        nameInputNode,
        ...(parentNode?.children ?? [])
      ])
}

/**
 * // TODO document
 * @param onConfirm
 * @param onCancel
 * @param expandPath
 * @param type
 * @param treeData
 * @param rightClickedItem
 */
export const openNameInput = async (
  onConfirm: (name: string) => void,
  onCancel: () => void,
  expandPath: (path: string) => Promise<void>,
  onInputInserted: (newTreeData: DataNode[]) => void,
  type: PathType,
  treeData: DataNode[] = [],
  rightClickedItem?: RightClickedItem
) => {
  const parentPath = getParentPathForNameInput(rightClickedItem)

  await expandPath(parentPath)

  const nameInputNode = createNameInputNode(onConfirm, onCancel, type)

  const newTreeData = insertNameInputNodeIntoTree(
    treeData,
    nameInputNode,
    parentPath
  )

  onInputInserted(newTreeData)
}

/**
 * Extends the default InputProps with callbacks for when the input was confirmed/cancelled
 */
interface FileTreeNameInputProps extends InputProps {
  /**
   * Callback when the input is cancelled (e.g. 'Escape'-key pressed)
   */
  onCancel?: () => void

  /**
   * Callback when the input was confirmed (e.g. 'Enter'-key pressed)
   *
   * @param name the name that was put in
   */
  onConfirm?: (name: string) => void
}
/**
 * A small input field which offers callbacks when the input was cancelled (escape-key) or confirmed (enter-key)
 */
const FileTreeNameInput = ({
  onCancel = noop,
  onConfirm = noop,
  ...inputProps
}: FileTreeNameInputProps) => {
  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = event => {
    if (event.key === 'Escape') {
      onCancel()
    } else if (event.key === 'Enter') {
      onConfirm(event.currentTarget.value)
    }
  }

  return (
    <Input {...inputProps} size="small" onKeyDown={handleKeyPress} autoFocus />
  )
}

export default FileTreeNameInput
