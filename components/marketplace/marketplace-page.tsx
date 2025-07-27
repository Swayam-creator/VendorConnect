"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/hooks/use-language"
import { useProductsStore } from "@/stores/products-store"
import { Search, Star, MapPin, ShoppingCart } from "lucide-react"

export function MarketplacePage() {
  const { t } = useLanguage()
  const router = useRouter();
  const { products } = useProductsStore()
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  // Group products by supplier
  const suppliers = products.reduce((acc: any[], product) => {
    const existingSupplier = acc.find(s => s.id === product.supplierId)
    if (existingSupplier) {
      existingSupplier.products.push(product.name)
      existingSupplier.priceRange = `₹${Math.min(existingSupplier.minPrice, product.price)}-${Math.max(existingSupplier.maxPrice, product.price)}`
      existingSupplier.minPrice = Math.min(existingSupplier.minPrice, product.price)
      existingSupplier.maxPrice = Math.max(existingSupplier.maxPrice, product.price)
    } else {
      acc.push({
        id: product.supplierId,
        name: product.supplierName,
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        location: product.origin,
        category: product.category,
        products: [product.name],
        priceRange: `₹${product.price}`,
        minPrice: product.price,
        maxPrice: product.price,
        verified: true,
        image: product.images[0] || "/placeholder.svg",
      })
    }
    return acc
  }, [])
  useEffect(() => {
    setFilteredProducts(suppliers)
  }, [products])

  useEffect(() => {
    let filtered = suppliers

    if (searchTerm) {
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.products.some((product) => product.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((supplier) => supplier.category === categoryFilter)
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((supplier) => supplier.location.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    setFilteredProducts(filtered)
  }, [searchTerm, categoryFilter, locationFilter, suppliers])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("supplier_marketplace")}</h1>
          <p className="text-gray-600">{t("marketplace_subtitle")}</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("search_suppliers")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_categories")}</SelectItem>
                <SelectItem value="vegetables">{t("vegetables")}</SelectItem>
                <SelectItem value="spices">{t("spices")}</SelectItem>
                <SelectItem value="oils">{t("oils")}</SelectItem>
                <SelectItem value="grains">{t("grains")}</SelectItem>
                <SelectItem value="dairy">{t("dairy")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("location")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_locations")}</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={supplier.image || "/placeholder.svg"}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
                {supplier.verified && <Badge className="absolute top-2 right-2 bg-green-600">{t("verified")}</Badge>}
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{supplier.rating}</span>
                  </div>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {supplier.location}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{t("products")}:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.products.slice(0, 3).map((product, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                      {supplier.products.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.products.length - 3} {t("more")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-600">{supplier.priceRange}</span>
                    <Button 
                 size="sm"
       onClick={() => router.push(`/product-details?supplier=${supplier.id}`)}>
            <ShoppingCart className="h-4 w-4 mr-2" />
           {t("view_products")}
            </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t("no_suppliers_found")}</p>
            <p className="text-gray-400 mt-2">{t("try_different_filters")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
