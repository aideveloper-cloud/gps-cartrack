import { Routes, Route, Navigate } from "react-router-dom";
import { Nav } from "./components/Nav";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { OrderNew } from "./pages/OrderNew";
import { OrderDetail } from "./pages/OrderDetail";
import { Jobs } from "./pages/Jobs";
import { Products } from "./pages/Products";
import { Vehicles } from "./pages/Vehicles";
import { Users } from "./pages/Users";
import { Tracking } from "./pages/Tracking";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />
      <Route path="/orders/new" element={<Layout><OrderNew /></Layout>} />
      <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />
      <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
      <Route path="/products" element={<Layout><Products /></Layout>} />
      <Route path="/vehicles" element={<Layout><Vehicles /></Layout>} />
      <Route path="/users" element={<Layout><Users /></Layout>} />
      <Route path="/tracking" element={<Layout><Tracking /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
