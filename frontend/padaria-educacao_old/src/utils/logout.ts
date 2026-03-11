import axios from "axios";

export async function logout() {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:8000/api/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Erro ao deslogar:", error);
  } finally {
    // Sempre limpa mesmo se API falhar
    localStorage.clear();
    window.location.href = "/";
  }
}