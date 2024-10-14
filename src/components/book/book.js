import React from 'react';
import './book.css'; // Ensure you have the correct styles
import MenuBar from '../menumain/menubar';
import Footer from '../Footer';
import book1 from '../../images/book1.png';

const books = [
  {
    title: 'Meditation',
    imageUrl: book1,
    downloadUrl: '/books/Meditation_Agasthiyar_2024.pdf',
  },
  {
    title: 'Agathiyar book',
    imageUrl: book1,
    downloadUrl: '/books/Meditation_Agasthiyar_2024.pdf',
  },
  {
    title: 'Mediation agathiyar',
    imageUrl: book1,
    downloadUrl: '/books/Meditation_Agasthiyar_2024.pdf',
  },
  {
    title: 'Vegetarian',
    imageUrl: book1,
    downloadUrl: '/books/Meditation_Agasthiyar_2024.pdf',
  },
];

const BookGrid = () => {
  return (
    <div className="book-grid">
      <MenuBar />
      <h3 className='book-title'>READ THE SCIENCE OF MEDITATION</h3>
      <div className="book-grid-container">
        {books.map((book, index) => (
          <div className="book-item" key={index}>
            <img src={book.imageUrl} alt={book.title} />
            <h3 style={{fontFamily: 'Raleway, sans-serif'}}>{book.title}</h3>
            <a href={book.downloadUrl} download>
              <button style={{fontFamily: 'Raleway, sans-serif'}}>CLICK TO DOWNLOAD PDF</button>
            </a>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default BookGrid;
