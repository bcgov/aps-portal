import { createContext, useContext } from 'react';

const AppContext = createContext({router: null});

export function AppWrapper({ children, router }) {
  const sharedState = { router: router }

  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

const Empty = () => ( <></> )
export default Empty
