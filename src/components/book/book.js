import React from 'react';
import './book.css'; // Ensure you have the correct styles
import MenuBar from '../menumain/menubar';
import Footer from '../Footer';
import book1 from '../../images/book1.png';

const books = [
  {
    title: 'Book 1',
    imageUrl: book1,
    downloadUrl: 'https://example.com/book1.pdf',
  },
  {
    title: 'Book 2',
    imageUrl: book1,
    downloadUrl: 'https://example.com/book2.pdf',
  },
  {
    title: 'Book 3',
    imageUrl: book1,
    downloadUrl: 'https://example.com/book3.pdf',
  },
  {
    title: 'Book 4',
    imageUrl: book1,
    downloadUrl: 'https://example.com/book4.pdf',
  },
];

const BookGrid = () => {
  return (
    <div className="book-grid">
      <MenuBar />
      <h1>READ THE SCIENCE OF MEDITATION</h1>
      <div className="grid-container">
        {books.map((book, index) => (
          <div className="book-item" key={index}>
            <img src={book.imageUrl} alt={book.title} />
            <h3>{book.title}</h3>
            <a href={book.downloadUrl} download>
              <button>CLICK TO DOWNLOAD PDF</button>
            </a>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default BookGrid;
