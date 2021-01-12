import * as React from 'react';
import Head from 'next/head';
import Typography from 'typography';
import '@bcgov/bc-sans/css/BCSans.css';
import '../shared/styles/global.css';

import { useRouter } from 'next/router';

const { useEffect, useState } = React;

import graphql from '../shared/services/graphql';

const GET_USER = `
    query GetUser {
        allTemporaryIdentities {
        name
        username
        email
        roles
        namespace
        }
    }
`;
import AppBar from '../components/app-bar';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  console.log(router);
  const links = [
    { name: 'Services', url: '/services', access: ['api-owner'] },
    {
      name: 'Access Requests',
      url: '/requests',
      access: ['api-manager', 'credential-admin'],
    },
    { name: 'Datasets', url: '/datasets', access: ['api-owner'] },
    {
      name: 'Credential Issuers',
      url: '/credential-issuers',
      access: ['credential-admin'],
    },
    {
      name: 'Service Accounts',
      url: '/service-accounts',
      access: ['api-owner'],
    },
    { name: 'API Discovery', url: '/api-discovery', access: ['developer'] },
    { name: 'My Credentials', url: '/my-credentials', access: ['developer'] },
    { name: 'Documentation', url: '/docs', access: null },
    { name: 'APS Admin', url: '/admin', access: ['aps-admin'] },
    { name: 'My Profile', url: '/my-profile', access: ['developer'] },
  ];

  let [{ state, user }, setState] = useState({ state: 'loading', user: null });
  let fetch = () => {
    graphql(GET_USER)
      .then(({ data }) => {
        setState({ state: 'loaded', user: data.allTemporaryIdentities[0] });
      })
      .catch((err) => {
        setState({ state: 'error', user: null });
      });
  };

  useEffect(fetch, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
        {/* <style type="text/css">{typography.toString()}</style> */}
      </Head>
      <AppBar
        links={links}
        pathname={router ? router.pathname : '/'}
        user={user}
      />
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}