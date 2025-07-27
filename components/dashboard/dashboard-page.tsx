"use client"

import { useAuth } from "@/hooks/use-auth"
import { Navigation } from "@/components/navigation"
import { VendorDashboard } from "@/components/dashboard/vendor-dashboard"
import { SupplierDashboard } from "@/components/dashboard/supplier-dashboard"
import { useRouter } from "next/navigation"

export function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  // Redirect to auth if not logged in
  if (!loading && !user) {
    router.push("/auth")
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile.userType === "vendor" ? (
          <VendorDashboard />
        ) : profile.userType === "supplier" ? (
          <SupplierDashboard />
        ) : (
          <div>Invalid user type</div>
        )}
      </div>
    </div>
  )
}
