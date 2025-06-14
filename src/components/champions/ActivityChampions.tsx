
import { FireOutlined, TrophyOutlined } from '@ant-design/icons';
import type { Champion, ChampionCalculatorProps } from './types';
import { calculMoyenne } from './utils';

export const calculateActivityChampions = ({ 
  joueursAnalyse, 
  getTitreGenre 
}: ChampionCalculatorProps): Champion[] => {
  const champions: Champion[] = [];
  const joueurs = Object.keys(joueursAnalyse);
  
  if (joueurs.length === 0) return champions;

  // Le plus actif
  const plusActif = joueurs.reduce((a, b) => 
    joueursAnalyse[a].totalJets > joueursAnalyse[b].totalJets ? a : b
  );
  
  champions.push({
    nom: plusActif,
    titre: getTitreGenre(plusActif, 'le plus actif', 'la plus active'),
    valeur: `${joueursAnalyse[plusActif].totalJets} jets`,
    icon: <FireOutlined style={{ fontSize: '24px' }} />,
    color: '#F56565'
  });

  // Le meilleur (meilleure moyenne)
  const meilleur = joueurs.reduce((a, b) => {
    const moyA = calculMoyenne(joueursAnalyse[a].resultats);
    const moyB = calculMoyenne(joueursAnalyse[b].resultats);
    return moyA > moyB ? a : b;
  });
  
  const moyenne = calculMoyenne(joueursAnalyse[meilleur].resultats);
  champions.push({
    nom: meilleur,
    titre: getTitreGenre(meilleur, 'le meilleur', 'la meilleure'),
    valeur: moyenne.toFixed(1),
    icon: <TrophyOutlined style={{ fontSize: '24px' }} />,
    color: '#38A169'
  });

  return champions;
}; 