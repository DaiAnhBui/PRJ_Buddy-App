// pages/_app.js

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "@/components/Layout";
import { ChakraProvider } from "@chakra-ui/react";

// AWS Amplify Authenticator
import { Amplify } from "aws-amplify";
import awsmobile from "../src/aws-exports";
import { Authenticator, useTheme, View, Heading, Text, Button } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ChatProvider from "@/Context/ChatProvider";
import { BrowserRouter as Router } from "react-router-dom";

Amplify.configure({ ...awsmobile, ssr: true });

export default function App({ Component, pageProps }) {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <Router>
            <ChatProvider>
              <ChakraProvider>
                <Layout user={user} signOut={signOut}>
                  <Component {...pageProps} user={user} signOut={signOut} />
                </Layout>
              </ChakraProvider>
            </ChatProvider>
          </Router>
        </>
      )}
    </Authenticator>
  );
}
