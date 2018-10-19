import React from "react";
import Link from "next/link";

import NavStyles from "../components/styles/NavStyles";

const Nav = () => (
  <NavStyles>
    <Link href="/">
      <a>Home</a>
    </Link>
    <Link href="/sell">
      <a>Sell</a>
    </Link>
  </NavStyles>
);

export default Nav;
