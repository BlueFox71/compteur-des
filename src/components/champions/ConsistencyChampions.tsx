
import type { Champion, ChampionCalculatorProps } from './types';
import { calculEcartType } from './utils';

export const calculateConsistencyChampions = ({ 
  joueursAnalyse, 
  getTitreGenre 
}: ChampionCalculatorProps): Champion[] => {
  const champions: Champion[] = [];
  const joueurs = Object.keys(joueursAnalyse);
  
  if (joueurs.length === 0) return champions;

  // Mr/Mme Régularité (faible écart-type)
  const regularite = joueurs.reduce((a, b) => {
    const ecartA = calculEcartType(joueursAnalyse[a].resultats);
    const ecartB = calculEcartType(joueursAnalyse[b].resultats);
    return ecartA < ecartB ? a : b;
  });
  
  if (joueursAnalyse[regularite].resultats.length >= 10) {
    const ecart = calculEcartType(joueursAnalyse[regularite].resultats);
    champions.push({
      nom: regularite,
      titre: getTitreGenre(regularite, 'Mr Régularité', 'Mme Régularité'),
      valeur: `écart-type ${ecart.toFixed(1)}`,
      icon: <span style={{ fontSize: '24px' }}>📏</span>,
      color: '#0891B2'
    });
  }

  // Chaos Incarné (fort écart-type)
  const chaos = joueurs.reduce((a, b) => {
    const ecartA = calculEcartType(joueursAnalyse[a].resultats);
    const ecartB = calculEcartType(joueursAnalyse[b].resultats);
    return ecartA > ecartB ? a : b;
  });
  
  if (joueursAnalyse[chaos].resultats.length >= 10) {
    const ecart = calculEcartType(joueursAnalyse[chaos].resultats);
    champions.push({
      nom: chaos,
      titre: getTitreGenre(chaos, 'chaos incarné', 'chaos incarné'),
      valeur: `écart-type ${ecart.toFixed(1)}`,
      icon: <span style={{ fontSize: '24px' }}>🌪️</span>,
      color: '#DC2626'
    });
  }

  return champions;
}; 