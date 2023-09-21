import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProductScreen() {
  const params = useParams();
  const slug = params.slug;
  return (
    <div>
      <h1>{slug}</h1>
    </div>
  );
}
