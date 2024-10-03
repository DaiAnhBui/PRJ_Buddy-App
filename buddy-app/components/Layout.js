// components/Layout.js

import { Container } from "react-bootstrap";
import MainNav from "./MainNav";

export default function Layout({ children, user, signOut }) {
    return (
      <>
        <MainNav user={user} signOut={signOut} />
        <br />
        <Container>
            {children}
        </Container>
        <br />
      </>
    );
  }
  