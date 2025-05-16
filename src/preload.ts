// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    login: (email: string, password: string) => ipcRenderer.invoke('login', { email, password }),
    getProducts: (search: string) => ipcRenderer.invoke('get-products', search),
    addProduct: (product: any) => ipcRenderer.invoke('add-product', product),
    uploadProductsCsv: (data: any) => ipcRenderer.invoke('upload-products-csv', data),
    getOrders: () => ipcRenderer.invoke('get-orders'),
    getInventory: () => ipcRenderer.invoke('get-inventory'),
    getInventoryAlerts: () => ipcRenderer.invoke('get-inventory-alerts'),
    getInventoryForecast: () => ipcRenderer.invoke('get-inventory-forecast'),
    getAnalyticsData: () => ipcRenderer.invoke('get-analytics-data'),
    getAnalyticsInsights: () => ipcRenderer.invoke('get-analytics-insights'),
});
