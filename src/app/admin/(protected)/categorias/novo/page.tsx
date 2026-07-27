import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Nova categoria" };

export default function NewCategoryPage() {
  return (
    <div>
      <Link
        href="/admin/categorias"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Voltar para categorias
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-ink">Nova categoria de votação</h1>
      <CategoryForm />
    </div>
  );
}
