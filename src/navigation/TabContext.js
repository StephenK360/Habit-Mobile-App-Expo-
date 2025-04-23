import React, { createContext, useContext } from 'react';

const TabContext = createContext(null);

export const TabProvider = ({ children, value }) => (
  <TabContext.Provider value={value}>
    {children}
  </TabContext.Provider>
);

export const useTabContext = () => useContext(TabContext);