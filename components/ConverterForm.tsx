// components/ConverterForm.js
import React, { useState } from 'react';

/**
 * @typedef {Object} ConverterFormProps
 * @property {string} placeholder
 * @property {(url: string) => void} onSubmit
 * @property {boolean} loading
 */

/**
 * A simple URL input + submit form.
 * @param {ConverterFormProps} props
 */
export default function ConverterForm({ placeholder, onSubmit, loading }) {
  const [url, setUrl] = useState('');

  return (
    <div style={{ margin: '1rem 0' }}>

      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit(url);
        }}
      >
        <input
          type="url"
          value={url}
          placeholder={placeholder}
          onChange={e => setUrl(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem' }}
        >
          {loading ? 'Converting…' : 'Convert'}
        </button>
      </form>
    </div>
  );
}