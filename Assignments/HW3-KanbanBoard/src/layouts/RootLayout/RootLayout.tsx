import type { ReactNode } from "react";

import { Outlet } from "react-router";

import Sidebar from "@/components/Sidebar/Sidebar.tsx";

import styles from "./RootLayout.module.css";

export default function RootLayout(): ReactNode {
  return (
    <div className={styles["root-layout"]}>
      <main>
        <Outlet />
      </main>
      <Sidebar />
    </div>
  );
}
