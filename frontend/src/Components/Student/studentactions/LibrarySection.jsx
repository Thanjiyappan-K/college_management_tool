import React from "react";
import "../studentactions/StudentCss/library.css";

const borrowedBooks = [
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    borrowedDate: "March 10, 2025",
    dueDate: "April 10, 2025",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    borrowedDate: "March 15, 2025",
    dueDate: "April 15, 2025",
  },
  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    borrowedDate: "March 20, 2025",
    dueDate: "April 20, 2025",
  },
];

const LibrarySection = () => (
  <div className="library-container">
    <h2>Library Resources</h2>
    <div className="library-search">
      <input type="text" placeholder="Search books, journals, resources..." />
      <button className="btn-primary">Search</button>
    </div>
    
    <div className="borrowed-books">
      <h3>My Borrowed Books</h3>
      <table className="books-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Borrowed Date</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {borrowedBooks.map((book, index) => (
            <tr key={index}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.borrowedDate}</td>
              <td>{book.dueDate}</td>
              <td>
                <button className="btn-small">Renew</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LibrarySection;