import { createContext, useContext } from "react";

type DrawerContextType = {
  open: () => void;
  close: () => void;
};

export const DrawerContext = createContext<DrawerContextType>({
  open: () => {},
  close: () => {},
});

export const useDrawer = () => useContext(DrawerContext);