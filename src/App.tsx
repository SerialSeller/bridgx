import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { JoinPage } from './features/onboarding/JoinPage'
import { EventErrorBoundary } from './lib/EventErrorBoundary'
import './lib/design.css'

function HomePlaceholder() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6 py-12">
      <p className="mb-8 text-lg font-semibold tracking-tight">BridgX</p>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight">
        Meet the right people here.
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-slate-600">
        One QR. No app. No login. Find who you should meet, why, and what to say first.
      </p>
      <p className="mt-8 rounded-xl border border-slate-200 p-4 text-sm text-slate-600" role="status">
        We’re getting the event ready. Check back soon.
      </p>
    </main>
  )
}

function AppRoutes() {
  const location = useLocation()
  return <EventErrorBoundary key={location.pathname + location.search}><Routes>
    <Route path="/e/:slug/join" element={<JoinPage />} />
    <Route path="/e/:slug/me" element={<JoinPage editMode />} />
    <Route path="*" element={<HomePlaceholder />} />
  </Routes></EventErrorBoundary>
}

function App() {
  if (!import.meta.env.VITE_CONVEX_URL) return <HomePlaceholder />
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default App
