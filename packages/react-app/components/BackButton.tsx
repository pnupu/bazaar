import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  href, 
  label = '', 
  className = ''
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center font-extrabold text-lg text-amber-500 hover:text-amber-600 transition-colors ${className}`}
      aria-label={label}
    >
      <ChevronLeftIcon className="h-8 w-8 mr-2" />
      <span className="sr-only">{label}</span>
    </button>
  );
};

export default BackButton;