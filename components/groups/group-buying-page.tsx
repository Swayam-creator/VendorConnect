// Update your GroupBuyingPage component
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"
import { GroupDetailsDialog } from "@/components/groups/group-details-dialog"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { useGroupsStore } from "@/stores/groups-store"
import { useNotificationsStore } from "@/stores/notifications-store"
import { Users, Clock, TrendingDown, MapPin } from "lucide-react"
import { toast } from "sonner" // Add this for notifications

export function GroupBuyingPage() {
  const { t } = useLanguage()
  const { user, profile } = useAuth()
  const { 
    groups, 
    createGroup, 
    joinGroup, 
    leaveGroup, 
    deleteGroup, 
    getActiveGroups, 
    getUserGroups, 
    isUserInGroup,
    canUserDeleteGroup 
  } = useGroupsStore()
  const { addNotification } = useNotificationsStore()
  
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const activeGroups = getActiveGroups()
  const myGroups = user ? getUserGroups(user.uid) : []

  const handleCreateGroup = (newGroup: any) => {
    if (user && profile) {
      createGroup({
        ...newGroup,
        organizerId: user.uid,
        organizer: profile.name
      })
    }
    toast.success("Group created successfully!")
  }

  const handleViewDetails = (group: any) => {
    setSelectedGroup(group)
    setIsDetailsDialogOpen(true)
  }

  const handleJoinGroup = (groupId: string) => {
    if (user && profile) {
      const group = groups.find(g => g.id === groupId)
      if (group) {
        const contribution = Math.floor(group.targetAmount / group.maxParticipants)
        joinGroup(groupId, user.uid, contribution)
        
        // Add notification for group organizer
        addNotification({
          userId: group.organizerId,
          title: "New Group Member",
          message: `${profile.name} joined your group "${group.title}"`,
          type: "group",
          read: false,
          actionUrl: "/groups"
        })
        
        toast.success(`Successfully joined "${group.title}"!`)
      }
    }
  }

  const handleLeaveGroup = (groupId: string) => {
    if (user && profile) {
      const group = groups.find(g => g.id === groupId)
      if (group && window.confirm(t("confirm_leave_group"))) {
        leaveGroup(groupId, user.uid)
        
        // Add notification for group organizer
        addNotification({
          userId: group.organizerId,
          title: "Member Left Group",
          message: `${profile.name} left your group "${group.title}"`,
          type: "group",
          read: false,
          actionUrl: "/groups"
        })
        
        toast.success(`Left "${group.title}" successfully`)
      }
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    if (user && window.confirm(t("confirm_delete_group"))) {
      deleteGroup(groupId, user.uid)
      toast.success("Group deleted successfully")
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const checkUserInGroup = (groupId: string) => {
    return user ? isUserInGroup(groupId, user.uid) : false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("group_buying")}</h1>
            <p className="text-gray-600">{t("group_buying_subtitle")}</p>
          </div>
          <CreateGroupDialog onCreateGroup={handleCreateGroup} />
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">{t("active_groups")}</TabsTrigger>
            <TabsTrigger value="my-groups">{t("my_groups")}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{group.title}</CardTitle>
                        <CardDescription className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {group.location}
                        </CardDescription>
                        <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {group.savings} {t("savings")}
                        </Badge>
                        {checkUserInGroup(group.id) && (
                          <Badge variant="outline" className="text-xs">
                            ✓ {t("joined")}
                          </Badge>
                        )}
                        {user && canUserDeleteGroup(group.id, user.uid) && (
                          <Badge variant="destructive" className="text-xs">
                            {t("organizer")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("progress")}</span>
                        <span>
                          ₹{group.currentAmount.toLocaleString()} / ₹{group.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(group.currentAmount, group.targetAmount)} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium">
                          {group.participants.length}/{group.maxParticipants}
                        </p>
                        <p className="text-xs text-gray-500">{t("participants")}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <p className="text-sm font-medium">{group.timeLeft}</p>
                        <p className="text-xs text-gray-500">{t("time_left")}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm font-medium">{group.savings}</p>
                        <p className="text-xs text-gray-500">{t("discount")}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        {t("organized_by")} <span className="font-medium">{group.organizer}</span>
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(group)}
                        >
                          {t("view_details")}
                        </Button>
                        {!checkUserInGroup(group.id) && group.participants.length < group.maxParticipants && (
                          <Button 
                            size="sm"
                            onClick={() => handleJoinGroup(group.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t("join_group")}
                          </Button>
                        )}
                        {checkUserInGroup(group.id) && user && !canUserDeleteGroup(group.id, user.uid) && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleLeaveGroup(group.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {t("leave_group")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-groups" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{group.title}</CardTitle>
                        <CardDescription className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {group.location}
                        </CardDescription>
                        <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={group.status === "completed" ? "default" : "secondary"}>
                          {t(group.status)}
                        </Badge>
                        {group.organizer === "You" && (
                          <Badge variant="outline" className="text-xs">
                            {t("organizer")}
                          </Badge>
                        )}
                        {user && canUserDeleteGroup(group.id, user.uid) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="ml-2"
                          >
                            {t("delete")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("progress")}</span>
                        <span>
                          ₹{group.currentAmount.toLocaleString()} / ₹{group.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(group.currentAmount, group.targetAmount)} />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        {group.participants.length} {t("participants")} • {group.savings} {t("savings")}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(group)}
                        >
                          {t("view_details")}
                        </Button>
                        {checkUserInGroup(group.id) && user && !canUserDeleteGroup(group.id, user.uid) && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleLeaveGroup(group.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {t("leave")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Group Details Dialog */}
      <GroupDetailsDialog
        group={selectedGroup}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onJoinGroup={handleJoinGroup}
        isUserInGroup={selectedGroup ? checkUserInGroup(selectedGroup.id) : false}
      />
    </div>
  )
}
