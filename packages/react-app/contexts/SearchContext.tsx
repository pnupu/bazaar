import React, { createContext, useState, ReactNode } from 'react';

type SearchContextType = {
  isSearchVisible: boolean;
  setIsSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SearchContext = createContext<SearchContextType>({
  isSearchVisible: true,
  setIsSearchVisible: () => {},
});

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(true);

  return (
    <SearchContext.Provider value={{ isSearchVisible, setIsSearchVisible }}>
      {children}
    </SearchContext.Provider>
  );
};