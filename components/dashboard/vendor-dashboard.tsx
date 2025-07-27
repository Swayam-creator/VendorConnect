"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import { useOrdersStore } from "@/stores/orders-store"
import { useGroupsStore } from "@/stores/groups-store"
import { ShoppingCart, TrendingUp, Users, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function VendorDashboard() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { getVendorOrders } = useOrdersStore()
  const { getUserGroups } = useGroupsStore()

  const [stats, setStats] = useState({
    totalOrders: 0,
    activeGroups: 0,
    totalSavings: 0,
    avgOrderValue: 0,
    monthlySpending: 0,
  })

  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    if (user && profile) {
      const userOrders = getVendorOrders(user.uid)
      const userGroups = getUserGroups(user.uid)
      
      // Calculate stats from real data
      const totalOrders = userOrders.length
      const activeGroups = userGroups.filter(g => g.status === 'active').length
      const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0
      const monthlySpending = userOrders
        .filter(order => {
          const orderDate = new Date(order.orderDate)
          const now = new Date()
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, order) => sum + order.totalAmount, 0)

      // Calculate savings (assuming 15% average savings)
      const totalSavings = Math.round(totalSpent * 0.15)

      setStats({
        totalOrders,
        activeGroups,
        totalSavings,
        avgOrderValue,
        monthlySpending,
      })

      // Set recent orders (last 3)
      setRecentOrders(userOrders.slice(-3).reverse())
    }
  }, [user, profile, getVendorOrders, getUserGroups])

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'orders':
        router.push('/orders')
        break
      case 'groups':
        router.push('/groups')
        break
      case 'marketplace':
        router.push('/marketplace')
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("welcome_back")}, {profile?.name}!
        </h1>
        <p className="text-gray-600 mt-2">{t("vendor_dashboard_subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('orders')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_orders")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders > 0 ? `₹${stats.avgOrderValue} ${t("avg_order_value")}` : t("no_orders_yet")}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('groups')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("active_groups")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGroups}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGroups > 0 ? t("participating_in_groups") : t("join_groups_to_save")}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_savings")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSavings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSavings > 0 ? t("through_bulk_buying") : t("start_saving_today")}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('marketplace')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("monthly_spending")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlySpending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlySpending > 0 ? t("this_month") : t("no_orders_this_month")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="orders">{t("recent_orders")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("quick_actions")}</CardTitle>
                <CardDescription>{t("quick_actions_desc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/marketplace">
                  <Button className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    {t("browse_suppliers")}
                  </Button>
                </Link>
                <Link href="/groups">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    {t("join_group_buying")}
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t("view_all_orders")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("business_insights")}</CardTitle>
                <CardDescription>{t("business_insights_desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("avg_order_value")}</span>
                    <span className="font-semibold">₹{stats.avgOrderValue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("total_orders")}</span>
                    <span className="font-semibold">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("monthly_spending")}</span>
                    <span className="font-semibold">₹{stats.monthlySpending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("total_savings")}</span>
                    <span className="font-semibold text-green-600">₹{stats.totalSavings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("recent_orders")}</CardTitle>
              <CardDescription>{t("recent_orders_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{order.supplierName}</h4>
                        <p className="text-sm text-gray-600">
                          {order.items.map((item: any) => item.name).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{order.totalAmount}</p>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "in-transit"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {t(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t("no_orders_yet")}</p>
                  <p className="text-gray-400 mt-2">{t("start_shopping_message")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}