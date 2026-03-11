import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Course } from "@/types";
import { setDocumentTitle } from "@/config/appConfig";

const mockCourses: Course[] = [
  { id: 1, title: "Higiene na Manipulação", featured: true },
  { id: 2, title: "Boas Práticas na Produção", featured: false },
  { id: 3, title: "Atendimento ao Cliente", featured: true },
  { id: 4, title: "Vendas no Balcão", featured: false },
  { id: 5, title: "Produção de Pães Artesanais", featured: false },
  { id: 6, title: "Padronização de Receitas", featured: false },
  { id: 7, title: "Controle de Estoque", featured: false },
  { id: 8, title: "Gestão de Equipe", featured: false },
];

const categories = ["Todas", "Higiene", "Atendimento", "Produção", "Gestão"];

export default function Courses() {
  useEffect(() => {
    setDocumentTitle("Cursos");
  }, []);

  const courseCategory: Record<number, string> = {
    1: "Higiene", 2: "Higiene",
    3: "Atendimento", 4: "Atendimento",
    5: "Produção", 6: "Produção",
    7: "Gestão", 8: "Gestão",
  };

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 4;

  const filteredCourses = mockCourses.filter((course) => {
    const cat = courseCategory[course.id] || "";
    const matchCategory = selectedCategory === "Todas" || cat === selectedCategory;
    const matchSearch = course.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-foreground">Cursos</h2>

      <div className="courses-container">
        <aside className="categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
            >
              {cat}
            </button>
          ))}
        </aside>

        <div className="courses-content">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="cards-grid">
            {paginatedCourses.map((course) => (
              <div key={course.id} className={`card ${course.featured ? "featured" : ""}`}>
                {course.featured && <span className="badge-featured">Destaque</span>}
                <h4>{course.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Categoria: {courseCategory[course.id]}
                </p>
                <Link to={`/curso/${course.id}`} className="course-button">
                  Acessar Curso
                </Link>
              </div>
            ))}
          </div>

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
  );
}
