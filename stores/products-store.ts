import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  minOrder: string
  category: string
  images: string[]
  inStock: boolean
  freshness: string
  origin: string
  certifications: string[]
  supplierId: string
  supplierName: string
  stockQuantity: number
}

interface ProductsState {
  products: Product[]
}

interface ProductsActions {
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (productId: string, updates: Partial<Product>) => void
  deleteProduct: (productId: string) => void
  getProductsBySupplier: (supplierId: string) => Product[]
  getProductById: (productId: string) => Product | null
  updateStock: (productId: string, quantity: number) => void
}

type ProductsStore = ProductsState & ProductsActions

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      // Initial state with demo products
      products: [
        {
          id: "1",
          name: "Premium Red Onions",
          description: "Fresh, premium quality red onions sourced from Maharashtra farms. Perfect for cooking and long storage.",
          price: 25,
          unit: "per kg",
          minOrder: "10 kg",
          category: "vegetables",
          images: ["/onions-1.jpg", "/onions-2.jpg"],
          inStock: true,
          freshness: "Harvested 2 days ago",
          origin: "Nashik, Maharashtra",
          certifications: ["Organic", "Pesticide-free"],
          supplierId: "1",
          supplierName: "Fresh Vegetables Co.",
          stockQuantity: 500
        },
        {
          id: "2",
          name: "Fresh Tomatoes",
          description: "Juicy, ripe tomatoes perfect for cooking and salads. Grown using sustainable farming practices.",
          price: 30,
          unit: "per kg",
          minOrder: "5 kg",
          category: "vegetables",
          images: ["/fresh-vegetables.png"],
          inStock: true,
          freshness: "Harvested 1 day ago",
          origin: "Pune, Maharashtra",
          certifications: ["Farm Fresh", "Quality Assured"],
          supplierId: "1",
          supplierName: "Fresh Vegetables Co.",
          stockQuantity: 300
        },
        {
          id: "3",
          name: "Turmeric Powder",
          description: "Pure turmeric powder with high curcumin content. Perfect for cooking and health benefits.",
          price: 180,
          unit: "per kg",
          minOrder: "2 kg",
          category: "spices",
          images: ["/chilli-turmeric.png"],
          inStock: true,
          freshness: "Ground fresh",
          origin: "Erode, Tamil Nadu",
          certifications: ["Organic", "FSSAI Approved"],
          supplierId: "2",
          supplierName: "Spice Masters",
          stockQuantity: 100
        },
        {
          id: "4",
          name: "Sunflower Oil",
          description: "Cold-pressed sunflower oil perfect for cooking and frying. Rich in vitamin E.",
          price: 120,
          unit: "per L",
          minOrder: "5 L",
          category: "oils",
          images: ["/Sunflower.jpg"],
          inStock: true,
          freshness: "Fresh batch",
          origin: "Karnataka",
          certifications: ["Cold Pressed", "No Preservatives"],
          supplierId: "3",
          supplierName: "Oil & More",
          stockQuantity: 200
        },
        {
          id: "5",
          name: "Basmati Rice",
          description: "Premium quality basmati rice with long grains and aromatic fragrance.",
          price: 80,
          unit: "per kg",
          minOrder: "25 kg",
          category: "grains",
          images: ["/Rice.jpg"],
          inStock: true,
          freshness: "New harvest",
          origin: "Punjab",
          certifications: ["Premium Grade", "Export Quality"],
          supplierId: "4",
          supplierName: "Grain Suppliers Ltd.",
          stockQuantity: 1000
        },
        {
          id: "6",
          name: "Fresh Paneer",
          description: "Fresh homemade paneer made from pure milk. Perfect for various dishes.",
          price: 200,
          unit: "per kg",
          minOrder: "1 kg",
          category: "dairy",
          images: ["/panner-milk.jpg"],
          inStock: true,
          freshness: "Made today",
          origin: "Local dairy",
          certifications: ["Fresh", "Pure Milk"],
          supplierId: "5",
          supplierName: "Dairy Fresh",
          stockQuantity: 50
        }
      ],

      // Actions
      addProduct: (newProduct) => {
        const product: Product = {
          ...newProduct,
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        }

        set((state) => ({
          products: [...state.products, product],
        }))
      },

      updateProduct: (productId, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId ? { ...product, ...updates } : product
          ),
        }))
      },

      deleteProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== productId),
        }))
      },

      getProductsBySupplier: (supplierId) => {
        return get().products.filter((product) => product.supplierId === supplierId)
      },

      getProductById: (productId) => {
        return get().products.find((product) => product.id === productId) || null
      },

      updateStock: (productId, quantity) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? { ...product, stockQuantity: Math.max(0, product.stockQuantity - quantity) }
              : product
          ),
        }))
      },
    }),
    {
      name: 'marketplace-products',
      version: 1,
    }
  )
)