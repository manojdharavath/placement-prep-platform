import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDesktop = window.innerWidth >= 1024;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0b0b15",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        style={{
          flex: 1,
          marginLeft: isDesktop ? "256px" : "0",
          transition: "margin-left .3s ease",
        }}
      >
        <Navbar
          title={title}
          setSidebarOpen={setSidebarOpen}
        />

        {children}
      </div>
    </div>
  );
}