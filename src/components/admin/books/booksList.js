import React, { useEffect, useState } from "react";
import "./bookslist.css";

const BASE_URL = "https://www.agathiyarpyramid.org";

export default function BooksList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/books`);
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load books");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert server path to public URL
   * /var/www/agathiyar-web/build/addbooks/abc.pdf
   * → https://www.agathiyarpyramid.org/addbooks/abc.pdf
   */
  const getPublicUrl = (serverPath) => {
    if (!serverPath) return "";
    const fileName = serverPath.split("/").pop();
    return `${BASE_URL}/addbooks/${encodeURIComponent(fileName)}`;
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.filename}"?`)) return;

    try {
      setDeleting(book.filepath);

      const res = await fetch(`${BASE_URL}/api/deletebook`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: book.id,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      // remove from UI
      setBooks(prev =>
        prev.filter(b => b.filepath !== book.filepath)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete book");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p>Loading books...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="books-container">
      <h2 className="align-center">Uploaded Books List</h2>

      <div className="book-grid-container1">
        {books.map((book, index) => (
          <div className="book-item1" key={index}>
            <img
              src={getPublicUrl(book.coverimgpath)}
              alt={book.filename}
              loading="lazy"
            />

            <h4>{book.filename}</h4>

            <div className="book-actions">
              {/* <a
                href={getPublicUrl(book.filepath)}
                target="_blank"
                rel="noopener noreferrer"
                className="view-btn1"
              >
                View PDF
              </a> */}

              <button
                className="delete-btn1"
                disabled={deleting === book.filepath}
                onClick={() => handleDelete(book)}
              >
                {deleting === book.filepath ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
