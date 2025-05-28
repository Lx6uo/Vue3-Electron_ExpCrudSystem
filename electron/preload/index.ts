import { contextBridge, ipcRenderer } from 'electron';

// 在渲染进程中暴露的API
contextBridge.exposeInMainWorld('api', {
  // 通用IPC调用方法
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data),

  // 获取当前用户
  getCurrentUser: () => ipcRenderer.invoke('get-current-user'),

  // 生产线相关
  getProductionLines: () => ipcRenderer.invoke('get-production-lines'),
  addProductionLine: (data: any) => ipcRenderer.invoke('add-production-line', data),
  updateProductionLine: (data: any) => ipcRenderer.invoke('update-production-line', data),
  deleteProductionLine: (id: number) => ipcRenderer.invoke('delete-production-line', { id }),

  // 生产线特殊信息相关
  getProductionLineSpecialInfo: (lineId: number, codeType: string) =>
    ipcRenderer.invoke('get-production-line-special-info', { lineId, codeType }),
  addProductionLineSpecialInfo: (data: any) =>
    ipcRenderer.invoke('add-production-line-special-info', data),
  deleteProductionLineSpecialInfo: (id: number) =>
    ipcRenderer.invoke('delete-production-line-special-info', { id }),

  // 特殊发动机相关
  getSpecialEngines: () => ipcRenderer.invoke('get-special-engines'),
  addSpecialEngine: (data: any) => ipcRenderer.invoke('add-special-engine', data),
  updateSpecialEngine: (data: any) => ipcRenderer.invoke('update-special-engine', data),
  deleteSpecialEngine: (id: number) => ipcRenderer.invoke('delete-special-engine', { id }),

  // 计划用颜色相关
  getPlannedColors: () => ipcRenderer.invoke('get-planned-colors'),
  addPlannedColor: (data: any) => ipcRenderer.invoke('add-planned-color', data),
  updatePlannedColor: (data: any) => ipcRenderer.invoke('update-planned-color', data),
  deletePlannedColor: (id: number) => ipcRenderer.invoke('delete-planned-color', { id }),
});

// 预加载脚本加载完成
console.log('预加载脚本已加载');