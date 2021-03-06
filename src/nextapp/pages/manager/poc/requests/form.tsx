import * as React from 'react';

const { useEffect, useState } = React;

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import { ADD } from './queries'

const Form = ({ refetch }) => {
    const [value, setValue] = useState('');

    return (
      <div>
        <form style={styles.form}
          onSubmit={e => {
            e.preventDefault();
            graphql(ADD, { name: value }).then(refetch);
            setValue('');
          }}
        >
          <input
            placeholder="Add new item"
            style={styles.formInput}
            className="addItem"
            value={value}
            onChange={event => {
              setValue(event.target.value);
            }}
          />
        </form>
      </div>
    );
  }

  export default Form
