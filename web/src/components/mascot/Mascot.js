import React from 'react';
import { Blobatar } from '@blobatar/react';
import PeanutBlobatar from './PeanutBlobatar';
import { isPeanut } from './peanut';

// The site's mascot: a regular blobatar, or, for about a quarter of names
// (fixed per name), one in the shape of the Peanut logo. Same props as
// <Blobatar>.
export default function Mascot(props) {
  return isPeanut(props.name) ? <PeanutBlobatar {...props} /> : <Blobatar {...props} />;
}
