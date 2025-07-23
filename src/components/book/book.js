import React, { useEffect, useState } from 'react';
import './book.css';
import MenuBar from '../menumain/menubar';
import Footer from '../Footer';
import defaultCover from '../../images/book1.png'; // fallback if image fails

const BookGrid = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://www.agathiyarpyramid.org/api/books')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedBooks = data.map((book) => ({
            title: book.filename,
            imageUrl: `https://www.agathiyarpyramid.org/images/${book.image}` || defaultCover,
            downloadUrl: `https://www.agathiyarpyramid.org/books/${book.pdf}`,
          }));
          setBooks(formattedBooks);
        } else {
          throw new Error('Unexpected API response');
        }
      })
      .catch((err) => {
        console.error('Failed to load books:', err);
        setError('Unable to fetch books at this time.');
      });
  }, []);

  return (
    <div className="book-grid">
      <MenuBar />
      {/* <h3 className="book-title">READ THE BOOKS</h3> */}

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div className="book-grid-container">
        {books.map((book, index) => (
          <div className="book-item" key={index}>
            <img
              src={book.imageUrl}
              alt={book.title}
              onError={(e) => (e.target.src = defaultCover)}
            />
            <h3 >{book.title}</h3>
            <a href={book.downloadUrl} download>
              <button >
                CLICK TO DOWNLOAD PDF
              </button>
            </a>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default BookGrid;
