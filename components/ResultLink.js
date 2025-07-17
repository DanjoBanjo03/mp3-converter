// components/ResultLink.js
import React from 'react';

/**
 * @typedef {Object} ResultLinkProps
 * @property {string|null} link
 * @property {string=} error
 */

/**
 * Renders a download link or error message.
 * @param {ResultLinkProps} props
 */
export default function ResultLink({ link, error }) {
  if (error) {
    return <div className="error">{error}</div>;
  }
  if (!link) {
    return null;
  }
  return (
    <div className="result">
      <a href={link} download>
        Download MP3
      </a>
    </div>
  );
}