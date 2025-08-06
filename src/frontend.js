import "./frontend.scss"
import React, { useState } from "react"
import domReady from '@wordpress/dom-ready';
import ReactDOM from "react-dom/client"

import App from "./App"

domReady( () => {

  const divsToUpdate = document.querySelectorAll("#auttom-rental-v2")

  console.log("Found divs to update:", divsToUpdate)

  divsToUpdate.forEach(div => {
    const root = ReactDOM.createRoot(div)
    root.render(<App {...{}} />)
  })

} );


