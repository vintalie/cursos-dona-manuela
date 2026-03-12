import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import type { Course } from "@/types";
import { getCourses, enrollInCourse } from "@/services/course.service";
import { getCategories, createCategory, deleteCategory } from "@/services/category.service";
import { useAuth } from "@/contexts/AuthContext";
import { setDocumentTitle } from "@/config/appConfig";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

export default function Courses() {
  const { isGerente } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 8;
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setDocumentTitle("Cursos");
  }, []);

  function fetchData() {
    setLoading(true);
    setError(false);
    Promise.all([getCourses(), getCategories()])
      .then(([coursesData, categoriesData]) => {
        setCourses(coursesData);
        setCategories(categoriesData);
        setError(false);
      })
      .catch(() => {
        setCourses([]);
        setCategories([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchCategory =
      selectedCategoryId === null ||
      course.category_id === selectedCategoryId;
    const matchSearch = course.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / coursesPerPage)
  );
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategoryLoading(true);
    try {
      const created = await createCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
    } catch {
      /* ignore */
    } finally {
      setCategoryLoading(false);
    }
  }

  async function handleDeleteCategoryConfirm() {
    if (!deleteCategoryTarget) return;
    setDeleteCategoryLoading(true);
    try {
      await deleteCategory(deleteCategoryTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryTarget.id));
      setDeleteCategoryTarget(null);
      getCourses().then(setCourses);
    } catch {
      /* ignore */
    } finally {
      setDeleteCategoryLoading(false);
    }
  }

  function handleAcessarCurso(course: Course) {
    navigate(`/curso/${course.id}`);
  }

  if (!loading && error) {
    return (
      <div>
        <h2 className="page-title mb-5 text-xl font-bold text-foreground">Cursos</h2>
        <div className="empty-state-wrapper bg-card rounded-xl border border-border">
          <EmptyState
            variant="error"
            title="Não foi possível carregar os cursos"
            description="Verifique sua conexão e tente novamente."
            onRetry={fetchData}
          />
        </div>
      </div>
    );
  }

  return (
    <PageLoader loading={loading}>
    <div>
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Cursos</h2>

      <div className="courses-container">
        <aside className="categories">
          <button
            className={selectedCategoryId === null ? "active" : ""}
            onClick={() => {
              setSelectedCategoryId(null);
              setCurrentPage(1);
            }}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="category-item-row w-full">
              <button
                className={`flex-1 ${selectedCategoryId === cat.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setCurrentPage(1);
                }}
              >
                {cat.name}
              </button>
              {isGerente && (
                <button
                  type="button"
                  className="btn-delete-category"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteCategoryTarget({ id: cat.id, name: cat.name });
                  }}
                  title="Excluir categoria"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {isGerente && (
            <form onSubmit={handleAddCategory} className="mt-3 pt-3 border-t border-border">
              <input
                type="text"
                placeholder="Nova categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full text-sm p-2 mb-2 border rounded"
              />
              <button
                type="submit"
                disabled={categoryLoading || !newCategoryName.trim()}
                className="w-full text-sm py-1.5 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
              >
                {categoryLoading ? "Adicionando..." : "Adicionar"}
              </button>
            </form>
          )}
        </aside>

        <ConfirmDeleteDialog
          open={!!deleteCategoryTarget}
          onOpenChange={(open) => !open && setDeleteCategoryTarget(null)}
          title="Excluir categoria"
          description={
            deleteCategoryTarget
              ? `Excluir "${deleteCategoryTarget.name}"? Os cursos associados ficarão sem categoria.`
              : ""
          }
          onConfirm={handleDeleteCategoryConfirm}
          loading={deleteCategoryLoading}
        />

        <div className="courses-content">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="cards-grid">
            {paginatedCourses.map((course) => (
              <div
                key={course.id}
                className={`card ${course.featured ? "featured" : ""}`}
              >
                {course.featured && (
                  <span className="badge-featured">Destaque</span>
                )}
                <h4 className="flex items-center gap-2">
                  {course.title}
                  {course.user_badges && course.user_badges.length > 0 && (
                    <span className="course-badges flex gap-1">
                      {course.user_badges.map((b) => (
                        <span key={b.id} title={b.title} className="badge-icon text-primary">
                          {b.image ? (
                            <img src={b.image} alt={b.title} className="badge-img w-5 h-5 object-contain" />
                          ) : (
                            <Star size={18} fill="currentColor" />
                          )}
                        </span>
                      ))}
                    </span>
                  )}
                </h4>
                {course.short_description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {course.short_description}
                  </p>
                )}
                {course.category && (
                  <p className="text-sm text-muted-foreground">
                    Categoria: {course.category.name}
                  </p>
                )}
                <button
                  className="course-button"
                  onClick={() => handleAcessarCurso(course)}
                >
                  {course.is_enrolled ? "Continuar" : "Começar"}
                </button>
              </div>
            ))}
          </div>

          {paginatedCourses.length === 0 && (
            <p className="text-muted-foreground py-8">
              Nenhum curso encontrado.
            </p>
          )}

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PageLoader>
  );
}
