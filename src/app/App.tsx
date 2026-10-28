import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { FoundationLayout } from '../layouts/FoundationLayout'
import { AuctionPage } from '../pages/AuctionPage'
import { AddItemPage } from '../pages/AddItemPage'
import { LoginPage } from '../pages/LoginPage'
import { HomePage } from '../features/home/ui/HomePage'
import { AuctionListPage } from '../features/auction/ui/AuctionListPage'
import { PresentationProvider } from './providers/PresentationProvider'
import { ScrollManager } from './ScrollManager'

function AppRoutes() {
  const location = useLocation()

  return (
    <Routes>
      <Route element={<FoundationLayout />}>
        <Route index element={<HomePage />} />
        <Route path="auctions" element={<AuctionListPage />} />
        <Route path="auction" element={<AuctionPage />} />
        <Route path="listing" element={<AddItemPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="*"
          element={<Navigate to={{ pathname: '/', search: location.search }} replace />}
        />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <>
      <ScrollManager />
      <PresentationProvider>
        <AppRoutes />
      </PresentationProvider>
    </>
  )
}
