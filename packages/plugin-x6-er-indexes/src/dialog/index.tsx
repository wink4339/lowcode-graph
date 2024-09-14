import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Icon, Dialog, Checkbox, Balloon } from '@alifd/next'
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

  const refs = useRef([]);

  const [visible, setVisible] = useState(false)
  const [options, setOptions] = useState({} as IDiaogOptions)
  const [loading, setLoading] = useState(false)

  const [fields, setFields] = useState([
    {
      id: 'id',
      name: 'ID',
      disabled: true
    },
    {
      id: 'create_time',
      name: '创建时间'
    },
    {
      id: 'update_time',
      name: '更新时间'
    },
    {
      id: 'order_sn',
      name: '入库单编号'
    }
  ])

  const [fieldsRef, setFieldsRef] = useState({} as any)

  const [indexes, setIndexes] = useState([] as any)
  const [selectedIndex, setSelectedIndex] = useState('')

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

  const generateCtxKey = (sign: any) => {
    return `${new Date().getTime()}-${sign}`
  }

  const addIndex = () => {
    const size = indexes.length
    const key = generateCtxKey(size)
    const index = {
      key,
      name: '',
      fields: ''
    } as any
    setIndexes(indexes.concat(index))
    setSelectedIndex(key)
  }

  const getDisplayName = (k: string) => {
    const indexFields = getIndexFields(k)

    let displayName = ''
    for(const index of indexFields) {
      for(const field of fields) {
        if (index.field == field.id) {
          if (displayName) {
            displayName += `-`
          }
          displayName += field.name
        }
      }
    }
    return displayName
  }

  const getDisplayLabel = () => {
    const indexFields = getIndexFields(selectedIndex) as any[]
    const size = indexFields.length
    if (size > 0) {
      return `已选择 ${size} 个字段`
    } 
    return '请选择索引字段'
  }

  const getIndexFields = (k: string) => {
    if (!k) return []
    if (indexes.length == 0) return []

    const index = findIndex(k)
    if (!index || !index.fields) return []

    return index.fields.split(',').map((e: any) => {
      const ss = e.trim().split(' ')
      return { field: ss[0], sortOrder: ss[1]}
    })
  }

  const findIndex = (k: string) => {
    for (let index of indexes) {
      if (index.key == k) {
        return index
      }
    }
    return undefined
  }

  const selectedFields = () => {
    const indexFields = getIndexFields(selectedIndex)
    const res = []
    for(const index of indexFields) {
      for(let field of fields) {
        if (index.field == field.id) {
          // @ts-ignore
          field.sortOrder = index.sortOrder
          res.push(field)
          break 
        }
      }
    }
    return res
  }

  const unselectedFields = () => {
    const indexFields = getIndexFields(selectedIndex)
    return fields.filter(e => !indexFields.some((f: any) => e.id == f.field))
  }

  const handleUnselectedFieldChange = (field: any, state: boolean) => {
    if (!state) return

    let index = findIndex(selectedIndex)
    if (!index) index = {}

    if (index.fields) {
      index.name += '-'
      index.fields += ','
    } 
    index.name += field.id,
    index.fields += `${field.id} ASC`
    setIndexes(JSON.parse(JSON.stringify(indexes)))
  }

  const handleSelectedFieldChange = (id: string, state: boolean) => {
    if (state) return

    let indexFields = getIndexFields(selectedIndex).filter((e: any) => e.field != id)
    let index = findIndex(selectedIndex)
    index.name = ''
    index.fields = ''
    indexFields.forEach((e: any) => {
      if (index.fields) {
        index.name += '-'
        index.fields += ','
      } 
      index.name += e.field,
      index.fields += `${e.field} ${e.sortOrder}`
    });

    for(let i in indexes) {
      if (indexes[i].key == selectedIndex) {
        indexes[i] == index
        break
      }
    }
    setIndexes(JSON.parse(JSON.stringify(indexes)))
  }

  const handleSelectedFieldSortOrderChange = (id: string, sortOrder: string) => {
    let indexFields = getIndexFields(selectedIndex)
    for(let i in indexFields) {
      if (indexFields[i].field == id) {
        indexFields[i].sortOrder = sortOrder
        break
      }
    }
    let index = findIndex(selectedIndex)
    index.name = ''
    index.fields = ''
    indexFields.forEach((e: any) => {
      if (index.fields) {
        index.name += '-'
        index.fields += ','
      } 
      index.name += e.field,
      index.fields += `${e.field} ${e.sortOrder}`
    });

    for(let i in indexes) {
      if (indexes[i].key == selectedIndex) {
        indexes[i] == index
        break
      }
    }
    setIndexes(JSON.parse(JSON.stringify(indexes)))
  }


  const handleSelectIndex = (k: string) => {
    setSelectedIndex(k)
  }

  const handleRemoveIndex = (k: string) => {
    for (let i in indexes) {
      if (indexes[i].key == k) {
        indexes.splice(i, 1)
        setIndexes(JSON.parse(JSON.stringify(indexes)))
        if (k == selectedIndex) {
          setSelectedIndex('')
        }
        return
      }
    }
  }

  let elementPosition = 0
  let elementTop = 0
  let offsetY = 0
  let dragging = false
  let maxTop = 0
  let moveFields = [] as any[]

  const getSelectedFieldPositon = (id: string) => {
    const fields = selectedFields() as any[]
    for(let i in fields) {
      if (fields[i].id == id)
        return Number.parseInt(i)
    }
    return 0
  }

  const handleMouseDown = (id: string, event: any) => {
    if (dragging) return

    moveFields = selectedFields()
    const size = moveFields.length
    if (size < 2) return

    const element = refs.current[id];
    const lastElement = refs.current[moveFields[size - 1].id];

    elementPosition = getSelectedFieldPositon(id)
    elementTop = Number.parseInt(element.style.top.replace('px', ''))
    maxTop = Number.parseInt(lastElement.style.top.replace('px', ''))
    offsetY = event.clientY;
    dragging = true
  };

  const handleMouseMove = (id: string, event: any) => {
    if (!dragging) return
    const element = refs.current[id];
    const newY = event.clientY - offsetY;
    const top = elementTop + newY
    if (top < 0) {
      element.style.top = `${0}px`
    } else if (top > maxTop) {
      element.style.top = `${maxTop}px`
    } else {
      element.style.top = `${top}px`
    }
    element.style.zIndex = 999
    const position = Math.round(top / 45.0)
    
    if (elementPosition == position) return

    let tmp = moveFields[elementPosition]
    if (position < elementPosition) {
      for (let i = elementPosition; i > position; i--) {
          moveFields[i] = moveFields[i - 1]
          refs.current[moveFields[i].id].style.top = `${i*45}px`
      } 
    } 
    if (position > elementPosition) {
      for(let i=elementPosition; i < position; i++) {
        moveFields[i] = moveFields[i + 1]
        refs.current[moveFields[i].id].style.top = `${i*45}px`
      }
    }
    moveFields[position] = tmp
    elementPosition = position
  }

  const handleMouseUp = (id: string, event: any) => {
    if (!dragging) return
    dragging = false
    const element = refs.current[id];
    element.style.zIndex = 1
    refs.current[id].style.top = `${elementPosition*45}px`

    // 最后更新有问题
    // let index = {name : '', fields: }
    // index.name = ''
    // index.fields = ''
    // indexFields.forEach((e: any) => {
    //   if (index.fields) {
    //     index.name += '-'
    //     index.fields += ','
    //   } 
    //   index.name += e.field,
    //   index.fields += `${e.field} ${e.sortOrder}`
    // });

    // for(let i in indexes) {
    //   if (indexes[i].key == selectedIndex) {
    //     indexes[i] == index
    //     break
    //   }
    // }
    // setIndexes(JSON.parse(JSON.stringify(indexes)))
  }

  const size = getIndexFields(selectedIndex).length
  const height = 46
  const dragHeight = size * (height - 1)
  return (
    <Dialog
      v2  
      title={'系统角色 索引'}
      visible={true}
      isFullScreen={true}
      overflowScroll={false}
      onOk={onConfirm}
      onCancel={onCancel}
      onClose={onCancel}
      okProps={{loading}}>
        <div className='data-model-grid-model-editor' style={{overflow: 'hidden'}}>
          <div className='data-model-editor-fields-index'>
            <div className='field-menu'>
              <div className='field-menu-scroll'>
                {
                  indexes.map((e: any, i: number) => <div key={e.key} className={`fields-menu-item ${selectedIndex == e.key ? 'active': ''}`}>
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
              !indexes.length || !selectedIndex
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
                        selectedFields().map((e: any, i) => 
                          <div key={e.id} ref={el => refs.current[e.id] = el} 
                            className='base-component-sort-list-item fields-item' 
                            style={{height, top: i * (height - 1)}}
                            onMouseMove={(event) => handleMouseMove(e.id, event)}
                            onMouseUp={(event) => handleMouseUp(e.id, event)}
                          >
                            <span className='base-component-sort-list-item-drag' style={{height}} 
                              onMouseDown={(event) => handleMouseDown(e.id, event)}
                            />
                            <div className='base-component-sort-list-item-content'>
                              <Checkbox style={{margin: '0px 16px'}} defaultChecked onChange={(state) => handleSelectedFieldChange(e.id, state)}/>{e.name}
                            </div>
                            <span className='base-component-sort-list-item-action'>
                                <div className="item-order-action">
                                  <span className={e.sortOrder == 'ASC' ? 'active' : ''} onClick={() => handleSelectedFieldSortOrderChange(e.id, 'ASC')}>升序</span>
                                  <span className={e.sortOrder == 'DESC' ? 'active' : ''} onClick={() => handleSelectedFieldSortOrderChange(e.id, 'DESC')}>降序</span>
                                </div>
                            </span>
                          </div>
                        )
                      }
                    </div>
                  }
                  <div style={{marginTop: size > 0 ? '-1px': '0px'}}>
                      {
                        unselectedFields().map(e => 
                          <div key={e.id} className='fields-item'>
                            <Checkbox style={{margin: '0px 16px 0px 53px'}} disabled={e.disabled} onChange={(state) => handleUnselectedFieldChange(e, state)}/>{e.name}
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

