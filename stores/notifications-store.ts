import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'order' | 'group' | 'system' | 'payment'
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationsState {
  notifications: Notification[]
}

interface NotificationsActions {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: (userId: string) => void
  deleteNotification: (notificationId: string) => void
  getUserNotifications: (userId: string) => Notification[]
  getUnreadCount: (userId: string) => number
}

type NotificationsStore = NotificationsState & NotificationsActions

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],

      // Actions
      addNotification: (newNotification) => {
        const notification: Notification = {
          ...newNotification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          notifications: [notification, ...state.notifications],
        }))
      },

      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        }))
      },

      markAllAsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.userId === userId
              ? { ...notification, read: true }
              : notification
          ),
        }))
      },

      deleteNotification: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== notificationId
          ),
        }))
      },

      getUserNotifications: (userId) => {
        return get().notifications.filter((notification) => notification.userId === userId)
      },

      getUnreadCount: (userId) => {
        return get().notifications.filter(
          (notification) => notification.userId === userId && !notification.read
        ).length
      },
    }),
    {
      name: 'marketplace-notifications',
      version: 1,
    }
  )
)