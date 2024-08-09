// components/BackButton.tsx

import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  href?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ href }) => {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center font-bold text-amber-500 hover:text-colors-primaryComp transition-colors"
    >
      <ArrowLeftIcon className="h-5 w-5 mr-1" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;