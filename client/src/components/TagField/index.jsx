import React from 'react';

const TagField = props => (
  <div className='tagField'>
    Who did you eat with? Put their emails here, separated by commas:
    <input id='taggedList' type='string' />
  </div>
)

export default TagField;