
import { BrowserRouter, Routes, Route } from "react-router";
import { useState, useEffect } from "react";
import api from "./services/api";

import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Entrevistados from "./pages/Entrevistados";
import Agendamentos from "./pages/Agendamentos";
import Historico from "./pages/Historico";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState(() =>
    localStorage.getItem("surte_token")
  );

  const [isChecking, setIsChecking] = useState(
    () => Boolean(localStorage.getItem("surte_token"))
  );

  const [authError, setAuthError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;

    const validateToken = async () => {
      setIsChecking(true);
      setAuthError("");

      try {
        await api.get("/auth/me");
      } catch (error) {
        if (cancelled) return;

        const status = error.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem("surte_token");
          setToken(null);
        } else {
          setAuthError(
            "Não foi possível verificar sua sessão. Verifique se o servidor está funcionando."
          );
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    validateToken();

    return () => {
      cancelled = true;
    };
  }, [token, retryCount]);

  const handleLogout = () => {
    localStorage.removeItem("surte_token");
    setToken(null);
    setSidebarOpen(false);
    setAuthError("");
  };

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Verificando sua sessão...</p>
      </div>
    );
  }

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  if (authError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6">
        <p className="text-center text-gray-700">{authError}</p>

        <button
          onClick={() => setRetryCount((count) => count + 1)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Tentar novamente
        </button>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:underline"
        >
          Voltar ao login
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto w-full">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/entrevistados" element={<Entrevistados />} />
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
