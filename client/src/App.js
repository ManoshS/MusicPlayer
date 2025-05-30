import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPlaylists from "./pages/MyPlaylists";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

const { Content } = Layout;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout className="layout" style={{ minHeight: "100vh" }}>
          <Navbar />
          <Content style={{ padding: "0 50px", marginTop: 64 }}>
            <div
              className="site-layout-content"
              style={{ padding: 24, minHeight: 380 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/my-playlists"
                  element={
                    <PrivateRoute>
                      <MyPlaylists />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
