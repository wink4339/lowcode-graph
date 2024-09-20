import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Icon, Dialog, Checkbox, Balloon, Button } from '@alifd/next'
import { event } from '@alilc/lowcode-engine';
import './index.scss'
import { IDiaogOptions } from '../types';
import { v4 as uuid } from 'uuid';

const DialogContext = createContext({
  openDialog: (options: IDiaogOptions = {}) => {
    event.emit('indexes.openDialog', options)
  },
  closeDialog: () => {
    event.emit('indexes.closeDialog')
  },
  openDialogLoading: () => {
    event.emit('indexes.openDialogLoading')
  },
  closeDialogLoading: () => {
    event.emit('indexes.closeDialogLoading')
  }
})

export const useDialog = () => useContext(DialogContext)

export default function InlineDialog() {

  const [visible, setVisible] = useState(false)
  const [options, setOptions] = useState({} as IDiaogOptions)
  const [loading, setLoading] = useState(false)

  const [btnDisabled, setBtnDisabled] = useState(true)
  const [columns, setColumns] = useState([] as any)
  const [indexes, setIndexes] = useState([] as any)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    init()
    event.on(`common:indexes.openDialog`, openDialog)
    event.on(`common:indexes.closeDialog`, closeDialog)
    event.on(`common:indexes.openDialogLoading`, openDialogLoading)
    event.on(`common:indexes.closeDialogLoading`, closeDialogLoading)

    return () => {
      event.off('common:indexes.openDialog', openDialog)
      event.off('common:indexes.closeDialog', closeDialog)
      event.off('common:indexes.openDialogLoading', openDialogLoading)
      event.off('common:indexes.closeDialogLoading', closeDialogLoading)
    }
  }, [])

  const init = () => {
    const columns = [
      {
        columnId: "id",
        columnName: "ID",
        disabled: true
      },
      {
        columnId: "username",
        columnName: "用户名"
      },
      {
        columnId: "orderId",
        columnName: "订单id"
      },
      {
        columnId: "tel",
        columnName: "手机号"
      },
      {
        columnId: "create_time",
        columnName: "创建时间"
      },
      {
        columnId: "update_time",
        columnName: "更新时间"
      }
    ]
    setColumns(columns)
  }


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
    options.onConfirm && options.onConfirm({entityId: options.entityId, indexes})
  }

  const onCancel = () => {
    if (options.onCancle) {
      options.onCancle()
    } else {
      closeDialog()
    }
  }

  const updateBtnDisbaled = () => {
    if (!btnDisabled) return
    setBtnDisabled(false)
  }

  const addIndex = () => {
    const key = uuid()
    const index = {
      key,
      name: '',
      fields: []
    } as any
    setIndexes(indexes.concat(index))
    setSelected(key)
    updateBtnDisbaled()
  }

  const findColumn = (columnId: string) => {
    if (!columnId) return null
    for(let i=0; i<columns.length; i++) {
      if (columns[i].columnId == columnId) {
        return {i, ...columns[i]}
      }
    }
    return null
  }

  const findIndex = (key: string) => {
    if (!key) return null
    for(let i=0; i<indexes.length; i++) {
      if (indexes[i].key == key) {
        return {i, ...indexes[i]}
      }
    }
    return null
  }

  const findIndexField = (key: string, id: string) => {
    if (!key) return null
    const index = findIndex(key)
    for(let i=0; i<index.fields.length; i++) {
      const field = index.fields[i]
      if(field.id == id) {
        return {i, ...field}
      }
    }
    return null
  }

  const generateIndexName = (index: any) => {
    let name = ''
    for(let i=0; i<index.fields.length; i++) {
      if(i !=0 ) name += '-'
      name += index.fields[i].id
    }
    return name
  }

  const getDisplayName = (k: string) => {
    const index = findIndex(k)
    let displayName = ''

    for(let i=0; i<index.fields.length; i++) {
      const item = index.fields[i]
      const column = findColumn(item.id)
      if (column) {
        if (i != 0) displayName += '-'
        displayName += column.columnName
      }
    }
    return displayName
  }

  const getDisplayLabel = () => {
    const index = findIndex(selected)
    const size = index.fields.length
    if (size > 0) {
      return `已选择 ${size} 个字段`
    } 
    return '请选择索引字段'
  }

  const selectedColumns = () => {
    if (!selected) return []
    let res = []
    for(let i=0; i<columns.length; i++) {
      let item = columns[i]
      const field = findIndexField(selected, item.columnId)
      if (field) {
        res.push({...item, sortOrder: field.sortOrder})
      }
    }
    return res
  }
  const unselectedColumns = () => {
    if (!selected) return columns
    return columns.filter((e: any) => !findIndexField(selected, e.columnId))
  }

  const handleUnselectedFieldChange = (columnId: any) => {
    let index = findIndex(selected)
    if (!index) return

    index.fields.push({id: columnId, sortOrder: 'ASC'})
    index.name = generateIndexName(index)
    indexes[index.i] = index
    setIndexes(JSON.parse(JSON.stringify(indexes)))
    updateBtnDisbaled()
  }

  const handleSelectedFieldChange = (id: string) => {
    let index = findIndex(selected)
    index.fields = index.fields.filter((e: any) => e.id != id)
    index.name = generateIndexName(index)
    indexes[index.i] = index

    setIndexes(JSON.parse(JSON.stringify(indexes)))
    updateBtnDisbaled()
  }

  const handleSelectedFieldSortOrderChange = (id: string, sortOrder: string) => {
    const index = findIndex(selected)
    const field = findIndexField(index.key, id)
    field.sortOrder = sortOrder
    index.fields[field.i] = field
    indexes[index.i] = index
    setIndexes(JSON.parse(JSON.stringify(indexes)))
    updateBtnDisbaled()
  }


  const handleSelectIndex = (k: string) => {
    setSelected(k)
  }

  const handleRemoveIndex = (k: string) => {
    const newIndexes = indexes.filter((e: any) => e.key != k)
    if (selected == k) setSelected('')
    setIndexes(newIndexes)
  }

  const size = selectedColumns().length
  const height = 46
  const dragHeight = size * (height - 1)
  return (
    <Dialog
      v2  
      title={'系统角色 索引'}
      visible={visible}
      isFullScreen={true}
      overflowScroll={false}
      onOk={onConfirm}
      onCancel={onCancel}
      onClose={onCancel}
      okProps={{loading, children: "保存", disabled: btnDisabled}}>
        <div className='data-model-grid-model-editor' style={{overflow: 'hidden'}}>
          <div className='data-model-editor-fields-index'>
            <div className='field-menu'>
              <div className='field-menu-scroll'>
                {
                  indexes.map((e: any, i: number) => <div key={e.key} className={`fields-menu-item ${selected == e.key ? 'active': ''}`}>
                     <Balloon v2 closable={false} trigger={<p onClick={() => handleSelectIndex(e.key)}>{i + 1}: { getDisplayName(e.key) || '空'}</p>}>
                        {i + 1}: { getDisplayName(e.key) || '空'}
                     </Balloon>
                     &nbsp;&nbsp;
                     <Balloon v2 closable={false} trigger={<span onClick={() => handleRemoveIndex(e.key)}/>}>
                        删除
                     </Balloon>
                  </div>)
                }
              </div>
              <div className="fields-add-button" onClick={addIndex}>+新增索引</div>
            </div>
            {
              !indexes.length || !selected
              ?
              <div className="fields-content fields-empty">
                <img src="https://img.alicdn.com/imgextra/i3/O1CN011k9Ijg1pi2e5xFRfj_!!6000000005393-2-tps-76-74.png" width="38" height="37"/>请创建索引
              </div> 
              :
              <div className='fields-content'>
                <div className="fields-content-selected">{getDisplayLabel()}</div>
                <div className='fields-scroll-box'>
                  
                  {
                    size == 0 ? null :
                    <div className='base-component-sort-list' style={{height: dragHeight}}>
                      {
                        selectedColumns().map((e: any, i) => 
                          <div
                            key={e.columnId}
                            className='base-component-sort-list-item fields-item' 
                            style={{height, top: i * (height - 1)}}
                          >
                            <span className='base-component-sort-list-item-drag' style={{height}} />
                            <div className='base-component-sort-list-item-content'>
                              <Checkbox style={{margin: '0px 16px'}} defaultChecked onChange={() => handleSelectedFieldChange(e.columnId)}/>{e.columnName}
                            </div>
                            <span className='base-component-sort-list-item-action'>
                                <div className="item-order-action">
                                  <span className={e.sortOrder == 'ASC' ? 'active' : ''} onClick={() => handleSelectedFieldSortOrderChange(e.columnId, 'ASC')}>升序</span>
                                  <span className={e.sortOrder == 'DESC' ? 'active' : ''} onClick={() => handleSelectedFieldSortOrderChange(e.columnId, 'DESC')}>降序</span>
                                </div>
                            </span>
                          </div>
                        )
                      }
                    </div>
                  }
                  <div style={{marginTop: size > 0 ? '-1px': '0px'}}>
                      {
                        unselectedColumns().map((e: any) => 
                          <div key={e.columnId} className='fields-item'>
                            <Checkbox style={{margin: '0px 16px 0px 53px'}} disabled={e.disabled} onChange={() => handleUnselectedFieldChange(e.columnId)}/>{e.columnName}
                          </div>
                        )
                      }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
    </Dialog>
  )
}

