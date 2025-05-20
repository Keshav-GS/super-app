// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    login: (email: string, password: string) => ipcRenderer.invoke('login', { email, password }),
    getProducts: (search: string) => ipcRenderer.invoke('get-products', search),
    addProduct: (product: any) => ipcRenderer.invoke('add-product', product),
    updateProduct: (id: string, product: any) => ipcRenderer.invoke('updateProduct', id, product),
    deleteProduct: (id: string) => ipcRenderer.invoke('deleteProduct', id),
    uploadProductsCsv: (fileData: { buffer: number[]; name: string; type: string }) => ipcRenderer.invoke('upload-products-csv', fileData),
    // Order-related APIs
    getOrders: (filters: any) => ipcRenderer.invoke("get-orders", filters),
    getOrderDetails: (id: number) => ipcRenderer.invoke("get-order-details", id),
    saveOrder: (orderData: any) => ipcRenderer.invoke("save-order", orderData),
    receiveOrder: (orderId: number) => ipcRenderer.invoke("receive-order", orderId),
    //deleteOrder: (id: number) => ipcRenderer.invoke("delete-order", id),
    getSuppliers: () => ipcRenderer.invoke("get-suppliers"),
    addSupplier: (supplierData: any) => ipcRenderer.invoke("add-supplier", supplierData),
    recordSale: (saleData: any) => ipcRenderer.invoke("record-sale", saleData),
    getSales: () => ipcRenderer.invoke("get-sales"),
    // Inventory-related APIs
    getInventory: () => ipcRenderer.invoke("get-inventory"),
    getReorderSuggestions: () => ipcRenderer.invoke("get-reorder-suggestions"),
    getForecast: (productId: number) => ipcRenderer.invoke("get-forecast", productId),
    recordStockMovement: (movementData: any) => ipcRenderer.invoke("record-stock-movement", movementData),
    saveInventoryControl: (controlData: any) => ipcRenderer.invoke("save-inventory-control", controlData),
    //Analytics-related APIs
    getAnalyticsData: () => ipcRenderer.invoke('get-analytics-data'),
    getAnalyticsInsights: () => ipcRenderer.invoke('get-analytics-insights'),
});
