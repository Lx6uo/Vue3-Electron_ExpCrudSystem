"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // 通用IPC调用方法
  invoke: (channel, data) => electron.ipcRenderer.invoke(channel, data),
  // 获取当前用户
  getCurrentUser: () => electron.ipcRenderer.invoke("get-current-user"),
  // 生产线相关
  getProductionLines: () => electron.ipcRenderer.invoke("get-production-lines"),
  addProductionLine: (data) => electron.ipcRenderer.invoke("add-production-line", data),
  updateProductionLine: (data) => electron.ipcRenderer.invoke("update-production-line", data),
  deleteProductionLine: (id) => electron.ipcRenderer.invoke("delete-production-line", { id }),
  // 生产线特殊信息相关
  getProductionLineSpecialInfo: (lineId, codeType) => electron.ipcRenderer.invoke("get-production-line-special-info", { lineId, codeType }),
  addProductionLineSpecialInfo: (data) => electron.ipcRenderer.invoke("add-production-line-special-info", data),
  deleteProductionLineSpecialInfo: (id) => electron.ipcRenderer.invoke("delete-production-line-special-info", { id }),
  // 特殊发动机相关
  getSpecialEngines: () => electron.ipcRenderer.invoke("get-special-engines"),
  addSpecialEngine: (data) => electron.ipcRenderer.invoke("add-special-engine", data),
  updateSpecialEngine: (data) => electron.ipcRenderer.invoke("update-special-engine", data),
  deleteSpecialEngine: (id) => electron.ipcRenderer.invoke("delete-special-engine", { id }),
  // 计划用颜色相关
  getPlannedColors: () => electron.ipcRenderer.invoke("get-planned-colors"),
  addPlannedColor: (data) => electron.ipcRenderer.invoke("add-planned-color", data),
  updatePlannedColor: (data) => electron.ipcRenderer.invoke("update-planned-color", data),
  deletePlannedColor: (id) => electron.ipcRenderer.invoke("delete-planned-color", { id })
});
console.log("预加载脚本已加载");
