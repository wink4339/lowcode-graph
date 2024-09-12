import { createContext, useContext, useEffect, useState } from 'react'
import { Icon, Dialog } from '@alifd/next'
import { event } from '@alilc/lowcode-engine';
import './index.scss'
import { DiaogType, IDiaogOptions } from '../types';

const DialogContext = createContext({
  openDialog: (options: IDiaogOptions = {}) => {
    event.emit('generic.openDialog', options)
  },
  closeDialog: () => {
    event.emit('generic.closeDialog')
  },
  openDialogLoading: () => {
    event.emit('generic.openDialogLoading')
  },
  closeDialogLoading: () => {
    event.emit('generic.closeDialogLoading')
  }
})

export const useDialog = () => useContext(DialogContext)

export default function InlineDialog() {
  const [visible, setVisible] = useState(false)
  const [options, setOptions] = useState({} as IDiaogOptions)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    event.on(`common:generic.openDialog`, openDialog)
    event.on(`common:generic.closeDialog`, closeDialog)
    event.on(`common:generic.openDialogLoading`, openDialogLoading)
    event.on(`common:generic.closeDialogLoading`, closeDialogLoading)

    return () => {
      event.off('common:generic.openDialog', openDialog)
      event.off('common:generic.closeDialog', closeDialog)
      event.off('common:generic.openDialogLoading', openDialogLoading)
      event.off('common:generic.closeDialogLoading', closeDialogLoading)
    }
  }, [])


  const openDialog = (options: IDiaogOptions = {}) => {
    setOptions(options)
    setVisible(true)
  }
  const closeDialog = () => {
    setVisible(false)
    setLoading(false)
  }

  const openDialogLoading = () => setLoading(true)
  const closeDialogLoading = () => setLoading(false)

  const onConfirm = () => {
    options.onConfirm && options.onConfirm()
  }

  const onCancel = () => {
    if (options.onCancle) {
      options.onCancle()
    } else {
      closeDialog()
    }
  }

  let defaultTitle = '注意'
  let iconType = 'prompt'
  let iconColor = '#5584ff'
  switch(options.type) {
    case DiaogType.Success:
      defaultTitle = '成功'
      iconType = 'success'
      iconColor = '#23c29e'
      break
    case DiaogType.Warning:
      defaultTitle = '警告'
      iconType = 'warning'
      iconColor = '#f5cb42'
      break
    case DiaogType.Error:
      defaultTitle = '错误'
      iconType = 'error'
      iconColor = '#f52d43'
      break
    case DiaogType.Help:
      defaultTitle = '帮助'
      iconType = 'help'
      iconColor = '#5584ff'
      break
  }

  return (
    <Dialog
      v2  
      title={<>
        <div className='generic-dialog-title-area tip'>
          <div className='tip-area'>
            <div className='generic-tip-head'>
              <Icon className='tip-pic' type={iconType} style={{color: iconColor}}/>
              <div className="tip-text">{options.title || defaultTitle}</div>
            </div>
          </div>
        </div>
      </>}
      visible={visible}
      overflowScroll={false}
      onOk={onConfirm}
      onCancel={onCancel}
      onClose={onCancel}
      okProps={{loading}}
      style={{width: '340px'}}>
        <div className='generic-dialog-content'>
          {options.content || ''}
        </div>
    </Dialog>
  )
}
