import React, { createContext, useState, useContext, ReactNode } from 'react';

type SearchContextType = {
  isSearchVisible: boolean;
  setIsSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchElementPresent: boolean;
  setIsSearchElementPresent: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [isSearchElementPresent, setIsSearchElementPresent] = useState(false);

  return (
    <SearchContext.Provider value={{ 
      isSearchVisible, 
      setIsSearchVisible, 
      isSearchElementPresent, 
      setIsSearchElementPresent 
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};