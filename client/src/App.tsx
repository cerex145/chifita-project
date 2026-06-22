import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { About } from "./pages/About";
import { Admin } from "./pages/Admin";
import { AuthCallback } from "./pages/AuthCallback";
import { CompleteProfile } from "./pages/CompleteProfile";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Materials } from "./pages/Materials";
import { Memes } from "./pages/Memes";
import { News } from "./pages/News";
import { NewsDetail } from "./pages/NewsDetail";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { Ranks } from "./pages/Ranks";
import { VisionMission } from "./pages/VisionMission";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="nosotros" element={<About />} />
        <Route path="vision-mision" element={<VisionMission />} />
        <Route path="materiales" element={<Materials />} />
        <Route path="memes" element={<Memes />} />
        <Route path="rangos" element={<Ranks />} />
        <Route path="noticias" element={<News />} />
        <Route path="noticias/:id" element={<NewsDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="auth/callback" element={<AuthCallback />} />

        <Route element={<ProtectedRoute allowIncompleteProfile />}>
          <Route path="completar-perfil" element={<CompleteProfile />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="perfil" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="admin" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  );
}
