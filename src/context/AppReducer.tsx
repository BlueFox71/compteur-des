import { createContext, useReducer, useContext, useEffect } from 'react';
import type { ReactNode, Dispatch } from 'react';

export interface Joueur { nom: string; }
export interface TypeJet { type: string; }
export interface JetDeDes {
  id?: string;
  joueur: string;
  typeJet: string;
  resultat: number;
  date?: string;
  commentaire?: string;
}

interface AppState {
  joueurs: Joueur[];
  typesJets: TypeJet[];
  jets: JetDeDes[];
}

type AppAction =
  | { type: 'SET_JOUEURS'; payload: Joueur[] }
  | { type: 'SET_TYPES_JETS'; payload: TypeJet[] }
  | { type: 'SET_JETS'; payload: JetDeDes[] }
  | { type: 'ADD_JET'; payload: JetDeDes }
  | { type: 'UPDATE_JET'; payload: { id: string; jet: JetDeDes } }
  | { type: 'CLEAR_JETS' };

const initialState: AppState = {
  joueurs: [],
  typesJets: [],
  jets: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_JOUEURS':
      return { ...state, joueurs: action.payload };
    case 'SET_TYPES_JETS':
      return { ...state, typesJets: action.payload };
    case 'SET_JETS':
      return { ...state, jets: action.payload };
    case 'ADD_JET':
      return { ...state, jets: [...state.jets, action.payload] };
    case 'UPDATE_JET':
      return {
        ...state,
        jets: state.jets.map(jet =>
          jet.id === action.payload.id ? action.payload.jet : jet
        )
      };
    case 'CLEAR_JETS':
      return { ...state, jets: [] };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Charger la configuration (joueurs, typesJets)
    fetch('http://localhost:3001/api/config')
      .then(res => res.json())
      .then(data => {
        dispatch({ type: 'SET_JOUEURS', payload: data.joueurs || [] });
        dispatch({ type: 'SET_TYPES_JETS', payload: data.typesJets || [] });
      });
    // Charger les jets
    fetch('http://localhost:3001/api/jets')
      .then(res => res.json())
      .then(data => {
        dispatch({ type: 'SET_JETS', payload: data.jets || [] });
      });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
} 