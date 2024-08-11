import React from 'react';
import BackButton from './BackButton'; 

interface HeaderWithBackButtonProps {
    title: string;
  }

const HeaderWithBackButton: React.FC<HeaderWithBackButtonProps> = ({title}) => (
  <div className="w-full max-w-md mb-4">
    <div className="flex items-center justify-between">
      <div className="w-1/3">
        <BackButton label="Go to Previous Page" className="text-2xl" />
      </div>
      <div className="w-1/2 flex justify-center">
        <h1 className="text-2xl font-bold whitespace-nowrap">{title}</h1>
      </div>
      <div className="w-1/3"></div>
    </div>
  </div>
);

export default HeaderWithBackButton;