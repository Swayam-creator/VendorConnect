import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GroupBuy {
  id: string
  title: string
  description: string
  organizer: string
  organizerId: string
  location: string
  targetAmount: number
  currentAmount: number
  participants: string[]
  maxParticipants: number
  timeLeft: string
  category: string
  savings: string
  status: "active" | "completed" | "upcoming"
  createdAt: string
  expiresAt: string
}

interface GroupsState {
  groups: GroupBuy[]
}

interface GroupsActions {
  createGroup: (group: Omit<GroupBuy, 'id' | 'createdAt' | 'currentAmount' | 'participants'>) => void
  joinGroup: (groupId: string, userId: string, contribution: number) => void
  leaveGroup: (groupId: string, userId: string) => void
  deleteGroup: (groupId: string, userId: string) => void
  updateGroup: (groupId: string, updates: Partial<GroupBuy>) => void
  getUserGroups: (userId: string) => GroupBuy[]
  getActiveGroups: () => GroupBuy[]
  isUserInGroup: (groupId: string, userId: string) => boolean
  canUserDeleteGroup: (groupId: string, userId: string) => boolean
}

type GroupsStore = GroupsState & GroupsActions

export const useGroupsStore = create<GroupsStore>()(
  persist(
    (set, get) => ({
      // Initial state with demo groups
      groups: [
        {
          id: "1",
          title: "Bulk Onion Purchase - Andheri",
          description: "Group buying 500kg onions at wholesale price from trusted supplier. Premium quality onions sourced directly from Maharashtra farms.",
          organizer: "Raj Kumar",
          organizerId: "vendor1",
          location: "Andheri, Mumbai",
          targetAmount: 15000,
          currentAmount: 12000,
          participants: ["vendor1", "vendor2", "vendor3"],
          maxParticipants: 12,
          timeLeft: "2 days",
          category: "vegetables",
          savings: "25%",
          status: "active",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Spice Mix Wholesale Deal",
          description: "Premium spices at 30% discount for bulk order. Includes turmeric, red chili powder, coriander powder, and garam masala.",
          organizer: "Priya Sharma",
          organizerId: "vendor2",
          location: "Karol Bagh, Delhi",
          targetAmount: 25000,
          currentAmount: 18500,
          participants: ["vendor2", "vendor4", "vendor5"],
          maxParticipants: 20,
          timeLeft: "5 days",
          category: "spices",
          savings: "30%",
          status: "active",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ],

      // Actions
      createGroup: (newGroup) => {
        const group: GroupBuy = {
          ...newGroup,
          id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          createdAt: new Date().toISOString(),
          currentAmount: 0,
          participants: [newGroup.organizerId],
        }

        set((state) => ({
          groups: [...state.groups, group],
        }))
      },

      joinGroup: (groupId, userId, contribution) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId && !group.participants.includes(userId)
              ? {
                  ...group,
                  participants: [...group.participants, userId],
                  currentAmount: group.currentAmount + contribution,
                }
              : group
          ),
        }))
      },

      leaveGroup: (groupId, userId) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  participants: group.participants.filter(id => id !== userId),
                  currentAmount: Math.max(0, group.currentAmount - (group.targetAmount / group.maxParticipants)),
                }
              : group
          ),
        }))
      },

      deleteGroup: (groupId, userId) => {
        const group = get().groups.find(g => g.id === groupId)
        if (group && group.organizerId === userId) {
          set((state) => ({
            groups: state.groups.filter((group) => group.id !== groupId),
          }))
        }
      },

      updateGroup: (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, ...updates } : group
          ),
        }))
      },

      getUserGroups: (userId) => {
        return get().groups.filter((group) => group.participants.includes(userId))
      },

      getActiveGroups: () => {
        return get().groups.filter((group) => group.status === "active")
      },

      isUserInGroup: (groupId, userId) => {
        const group = get().groups.find(g => g.id === groupId)
        return group ? group.participants.includes(userId) : false
      },

      canUserDeleteGroup: (groupId, userId) => {
        const group = get().groups.find(g => g.id === groupId)
        return group ? group.organizerId === userId : false
      },
    }),
    {
      name: 'marketplace-groups',
      version: 1,
    }
  )
)