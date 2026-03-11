import { Link } from "react-router-dom";
import { useState } from "react";

interface Course {
  id: number;
  title: string;
  category: string;
  featured?: boolean;
}

const mockCourses: Course[] = [
  { id: 1, title: "Higiene na Manipulação", category: "Higiene", featured: true },
  { id: 2, title: "Boas Práticas na Produção", category: "Higiene" },
  { id: 3, title: "Atendimento ao Cliente", category: "Atendimento", featured: true },
  { id: 4, title: "Vendas no Balcão", category: "Atendimento" },
  { id: 5, title: "Produção de Pães Artesanais", category: "Produção" },
  { id: 6, title: "Padronização de Receitas", category: "Produção" },
  { id: 7, title: "Controle de Estoque", category: "Gestão" },
  { id: 8, title: "Gestão de Equipe", category: "Gestão" },
];

const categories = ["Todas", "Higiene", "Atendimento", "Produção", "Gestão"];

export default function Courses() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [currentPage, setCurrentPage] = useState(1);

  const coursesPerPage = 4;

  const filteredCourses = mockCourses.filter((course) => {
    const matchCategory =
      selectedCategory === "Todas" || course.category === selectedCategory;

    const matchSearch = course.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  return (
      <div className="courses-page">
        <h2>Cursos</h2>

        <div className="courses-container">
          {/* CATEGORIAS */}
          <aside className="categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
              >
                {cat}
              </button>
            ))}
          </aside>

          {/* LISTA DE CURSOS */}
          <div className="courses-content">
            {/* PESQUISA */}
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

            {/* CURSOS */}
            <div className="cards">
              {paginatedCourses.map((course) => (
                <div
                  key={course.id}
                  className={`card ${course.featured ? "featured" : ""}`}
                >
                  {course.featured && <span className="badge-featured">Destaque</span>}
                  <h4>{course.title}</h4>
                  <p>Categoria: {course.category}</p>
                  <Link
                    to="/curso/higiene-na-manipulacao"
                    className="course-button"
                  >
                    Acessar Curso
                  </Link>
                  
                </div>
              ))}
            </div>

            {/* PAGINAÇÃO */}
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