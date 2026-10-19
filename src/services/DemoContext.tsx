import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { DemoRepository, DemoState } from "../domain/types";
import { LocalDemoRepository } from "./demoRepository";

const DemoContext = createContext<{
  repository: DemoRepository;
  state: DemoState;
} | null>(null);

export function DemoProvider({
  children,
  repository: provided,
}: {
  children: ReactNode;
  repository?: DemoRepository;
}) {
  const repository = useMemo(
    () => provided ?? new LocalDemoRepository(),
    [provided],
  );
  const state = useSyncExternalStore(
    repository.subscribe,
    repository.getState,
    repository.getState,
  );
  return (
    <DemoContext.Provider value={{ repository, state }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo deve ser usado dentro de DemoProvider");
  return value;
}
