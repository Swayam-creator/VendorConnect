import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  unit: string
}

export interface Order {
  id: string
  vendorId: string
  vendorName: string
  supplierId: string
  supplierName: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled'
  orderDate: string
  deliveryDate?: string
  trackingId?: string
  supplierContact: string
  deliveryAddress: string
  groupId?: string
}

interface OrdersState {
  orders: Order[]
  vendorOrders: Order[]
  supplierOrders: Order[]
}

interface OrdersActions {
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => void
  updateOrderStatus: (orderId: string, status: Order['status'], trackingId?: string) => void
  getVendorOrders: (vendorId: string) => Order[]
  getSupplierOrders: (supplierId: string) => Order[]
  getOrderById: (orderId: string) => Order | null
  reorder: (orderId: string) => void
  cancelOrder: (orderId: string) => void
}

type OrdersStore = OrdersState & OrdersActions

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      // Initial state
      orders: [],
      vendorOrders: [],
      supplierOrders: [],

      // Actions
      addOrder: (newOrder) => {
        const order: Order = {
          ...newOrder,
          id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          orderDate: new Date().toISOString(),
        }

        set((state) => ({
          orders: [...state.orders, order],
        }))
      },

      updateOrderStatus: (orderId, status, trackingId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  ...(trackingId && { trackingId }),
                  ...(status === 'delivered' && { deliveryDate: new Date().toISOString() }),
                }
              : order
          ),
        }))
      },

      getVendorOrders: (vendorId) => {
        return get().orders.filter((order) => order.vendorId === vendorId)
      },

      getSupplierOrders: (supplierId) => {
        return get().orders.filter((order) => order.supplierId === supplierId)
      },

      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId) || null
      },

      reorder: (orderId) => {
        const order = get().getOrderById(orderId)
        if (order) {
          get().addOrder({
            ...order,
            status: 'pending',
            deliveryDate: undefined,
            trackingId: undefined,
          })
        }
      },

      cancelOrder: (orderId) => {
        get().updateOrderStatus(orderId, 'cancelled')
      },
    }),
    {
      name: 'marketplace-orders',
      version: 1,
    }
  )
)