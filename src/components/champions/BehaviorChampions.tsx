
import type { Champion, ChampionCalculatorProps } from './types';
import { calculPourcentageTranche } from './utils';

export const calculateBehaviorChampions = ({ 
  joueursAnalyse, 
  getTitreGenre 
}: ChampionCalculatorProps): Champion[] => {
  const champions: Champion[] = [];
  const joueurs = Object.keys(joueursAnalyse);
  
  if (joueurs.length === 0) return champions;

  // Tout ou Rien (résultats extrêmes)
  const toutOuRien = joueurs.reduce((a, b) => {
    const extremesA = joueursAnalyse[a].resultats.filter(r => r <= 3 || r >= 18).length / joueursAnalyse[a].resultats.length;
    const extremesB = joueursAnalyse[b].resultats.filter(r => r <= 3 || r >= 18).length / joueursAnalyse[b].resultats.length;
    return extremesA > extremesB ? a : b;
  });
  
  const tauxExtremes = (joueursAnalyse[toutOuRien].resultats.filter(r => r <= 3 || r >= 18).length / joueursAnalyse[toutOuRien].resultats.length * 100);
  if (tauxExtremes >= 25) {
    champions.push({
      nom: toutOuRien,
      titre: getTitreGenre(toutOuRien, 'tout ou rien', 'tout ou rien'),
      valeur: `${tauxExtremes.toFixed(1)}% d'extrêmes`,
      icon: <span style={{ fontSize: '24px' }}>⚡</span>,
      color: '#EC4899'
    });
  }

  // Maître Zen (résultats équilibrés)
  const maitreZen = joueurs.reduce((a, b) => {
    const equilibresA = calculPourcentageTranche(joueursAnalyse[a].resultats, 8, 13);
    const equilibresB = calculPourcentageTranche(joueursAnalyse[b].resultats, 8, 13);
    return equilibresA > equilibresB ? a : b;
  });
  
  const tauxEquilibre = calculPourcentageTranche(joueursAnalyse[maitreZen].resultats, 8, 13);
  if (tauxEquilibre >= 40) {
    champions.push({
      nom: maitreZen,
      titre: getTitreGenre(maitreZen, 'maître zen', 'maîtresse zen'),
      valeur: `${tauxEquilibre.toFixed(1)}% équilibrés`,
      icon: <span style={{ fontSize: '24px' }}>🧘‍♂️</span>,
      color: '#06B6D4'
    });
  }

  return champions;
}; 