import * as React from 'react';
import Modal from 'react-modal';

import { GET_LIST } from './queries';

import { useAppContext } from '@/pages/context';

import { useAuth } from '@/shared/services/auth';

const { useEffect, useState } = React;

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql';

import List from './list';

const customStyles = {
  content: {
    top: '30%',
    left: '20%',
    right: '20%',
    bottom: 'auto',
    transformx: 'translate(-50%, -50%)',
  },
  overlay: {},
};

const MyCredentialsPage = () => {
  const context = useAppContext();
  const auth = useAuth();

  const [{ state, data }, setState] = useState({
    state: 'loading',
    data: null,
  });

  const fetch = () => {
    graphql(GET_LIST, { id: auth.user ? auth.user.userId : '' })
      .then(({ data }) => {
        setState({ state: 'loaded', data });
      })
      .catch((err) => {
        setState({ state: 'error', data: null });
      });
  };

  useEffect(fetch, [auth.user]);

  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }
  return (
    <div style={styles.app}>
      <h1 style={styles.mainHeading}>My Credentials</h1>
      <div style={styles.formWrapper}>
        {/* <button style={styles.primaryButton}>Generate new API Key</button>
                <button style={styles.primaryButton} onClick={openModal}>Request Access</button> */}

        <List data={data} state={state} refetch={fetch} />
      </div>

      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Request Access"
      >
        <div style={styles.innerModal}>
          <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Request Access</h2>
          <div>Step 1. Select the API that you want to get access to?</div>
          <div>Step 2. Which Environment?</div>
          <form>
            <button style={styles.primaryButton}>Submit</button>
            <button style={styles.primaryButton} onClick={closeModal}>
              close
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MyCredentialsPage;
