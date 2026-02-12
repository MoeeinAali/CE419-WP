import { type ReactNode } from "react";

import { Route, Routes } from "react-router";

import RootLayout from "@/layouts/RootLayout/RootLayout.tsx";

import BoardPage from "@/pages/BoardPage/BoardPage.tsx";
import HomePage from "@/pages/HomePage/HomePage.tsx";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage.tsx";
import TagsPage from "@/pages/TagsPage/TagsPage.tsx";

export default function App(): ReactNode {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="board/:boardId" element={<BoardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
