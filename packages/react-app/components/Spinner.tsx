import React from 'react';

const Spinner = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-300"></div>
    </div>
  );
};

export default Spinner;
