import React from "react";
import RoutesArray from "./routing/RoutingPaths";
import '../src/App.scss';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

function App() {
  const tableHeaders = document.querySelectorAll('.ant-table-cell');

  // Remove tooltip on hover by setting title to an empty string
  tableHeaders.forEach(th => {
    th.addEventListener('mouseenter', () => {
      th.setAttribute('title', '');
    });
  });
  return (
    <>
      <div className="App">
        <RoutesArray />
      </div>
    </>
  );
}

export default App;
