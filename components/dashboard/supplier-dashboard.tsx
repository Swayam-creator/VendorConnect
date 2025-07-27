"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import { useOrdersStore } from "@/stores/orders-store"
import { useProductsStore } from "@/stores/products-store"
import { Package, TrendingUp, ShoppingCart, Users, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function SupplierDashboard() {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { getSupplierOrders } = useOrdersStore()
  const { getProductsBySupplier } = useProductsStore()

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
  })

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    if (user && profile) {
      const supplierOrders = getSupplierOrders(user.uid)
      const supplierProducts = getProductsBySupplier(user.uid)
      
      // Calculate stats from real data
      const totalOrders = supplierOrders.length
      const totalProducts = supplierProducts.length
      const pendingOrders = supplierOrders.filter(order => order.status === 'pending').length
      const totalRevenue = supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const monthlyRevenue = supplierOrders
        .filter(order => {
          const orderDate = new Date(order.orderDate)
          const now = new Date()
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, order) => sum + order.totalAmount, 0)
      
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
      const uniqueCustomers = new Set(supplierOrders.map(order => order.vendorId)).size

      setStats({
        totalProducts,
        totalOrders,
        monthlyRevenue,
        pendingOrders,
        avgOrderValue,
        totalCustomers: uniqueCustomers,
      })

      // Set recent orders (last 5)
      setRecentOrders(supplierOrders.slice(-5).reverse())
      
      // Set top products (first 3 for demo)
      setTopProducts(supplierProducts.slice(0, 3))
    }
  }, [user, profile, getSupplierOrders, getProductsBySupplier])

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'products':
        router.push('/supplier/products')
        break
      case 'orders':
        router.push('/supplier/orders')
        break
      case 'add-product':
        router.push('/supplier/add-product')
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
        <p className="text-gray-600 mt-2">{t("supplier_dashboard_subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('products')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_products")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts > 0 ? t("products_listed") : t("add_products_to_start")}
            </p>
          </CardContent>
        </Card>

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
              {stats.pendingOrders > 0 ? `${stats.pendingOrders} ${t("pending")}` : t("all_orders_processed")}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("monthly_revenue")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgOrderValue > 0 ? `₹${stats.avgOrderValue} ${t("avg_order_value")}` : t("no_sales_this_month")}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_customers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCustomers > 0 ? t("unique_customers") : t("no_customers_yet")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="orders">{t("recent_orders")}</TabsTrigger>
          <TabsTrigger value="products">{t("top_products")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("quick_actions")}</CardTitle>
                <CardDescription>{t("manage_your_business")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start"
                  onClick={() => handleCardClick('add-product')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("add_new_product")}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleCardClick('products')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("view_all_products")}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleCardClick('orders')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t("manage_orders")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("business_insights")}</CardTitle>
                <CardDescription>{t("your_performance_overview")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("total_revenue")}</span>
                    <span className="font-semibold">₹{stats.monthlyRevenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("avg_order_value")}</span>
                    <span className="font-semibold">₹{stats.avgOrderValue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("total_customers")}</span>
                    <span className="font-semibold">{stats.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("products_listed")}</span>
                    <span className="font-semibold">{stats.totalProducts}</span>
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
              <CardDescription>{t("latest_orders_from_customers")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.vendorName}</p>
                        <p className="text-xs text-gray-500">
                          {order.items.length} items • {new Date(order.orderDate).toLocaleDateString()}
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
                  <p className="text-gray-400 mt-2">{t("orders_will_appear_here")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("your_products")}</CardTitle>
              <CardDescription>{t("manage_your_product_listings")}</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-600">₹{product.price} {product.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={product.inStock ? "default" : "destructive"}>
                          {product.inStock ? t("in_stock") : t("out_of_stock")}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.stockQuantity} {t("units_available")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t("no_products_listed")}</p>
                  <p className="text-gray-400 mt-2">{t("add_products_to_start_selling")}</p>
                  <Button 
                    className="mt-4"
                    onClick={() => handleCardClick('add-product')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("add_first_product")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}