import type { Champion, ChampionCalculatorProps } from './types';
import { calculateActivityChampions } from './ActivityChampions';
import { calculateExtremeChampions } from './ExtremeChampions';
import { calculateRangeChampions } from './RangeChampions';
import { calculateBehaviorChampions } from './BehaviorChampions';
import { calculateConsistencyChampions } from './ConsistencyChampions';
import { calculateSpecialChampions } from './SpecialChampions';

export const calculateAllChampions = (props: ChampionCalculatorProps): Champion[] => {
  const allChampions: Champion[] = [];

  // Calcul par catégorie dans l'ordre organisé
  allChampions.push(...calculateActivityChampions(props));      // 1. Activité et performance
  allChampions.push(...calculateExtremeChampions(props));       // 2. Extrêmes et chance
  allChampions.push(...calculateRangeChampions(props));         // 3. Tranches de résultats
  allChampions.push(...calculateBehaviorChampions(props));      // 4. Styles de jeu
  allChampions.push(...calculateConsistencyChampions(props));   // 5. Consistance
  allChampions.push(...calculateSpecialChampions(props));       // 6. Spéciaux (perfectionniste, progression, spécialistes, boulet)

  return allChampions;
};

export const getChampionTooltip = (title: string): string => {
  const tooltips: { [key: string]: string } = {
    // Statistiques générales
    'Jets enregistrés': 'Nombre total de jets de dés enregistrés dans toutes les séances sélectionnées',
    'Séances jouées': 'Nombre de séances de jeu comptabilisées selon le filtre appliqué',
    
    // Performance et activité
    'Le plus actif': 'Le joueur le plus prolifique - celui qui lance des dés le plus souvent et participe activement',
    'La plus active': 'La joueuse la plus prolifique - celle qui lance des dés le plus souvent et participe activement',
    'Le meilleur': 'Le joueur avec la moyenne générale la plus élevée - le plus performant statistiquement',
    'La meilleure': 'La joueuse avec la moyenne générale la plus élevée - la plus performante statistiquement',
    
    // Extrêmes et chance
    'Le roi des 20': 'Le maître des coups critiques - spécialiste des réussites exceptionnelles avec un maximum de 20',
    'La reine des 20': 'La maîtresse des coups critiques - spécialiste des réussites exceptionnelles avec un maximum de 20',
    'Le chanceux': 'Le joueur béni par la chance - obtient régulièrement des résultats élevés (≥15) avec un taux de réussite exceptionnel',
    'La chanceuse': 'La joueuse bénie par la chance - obtient régulièrement des résultats élevés (≥15) avec un taux de réussite exceptionnel',
    'Le malchanceux': 'Le joueur touché par la poisse - enchaîne parfois les petits résultats (≤5) dans des séries malheureuses',
    'La malchanceuse': 'La joueuse touchée par la poisse - enchaîne parfois les petits résultats (≤5) dans des séries malheureuses',
    'Le collectionneur de 1': 'Le spécialiste des échecs critiques - accumule les résultats de 1 (mais ça arrive aux meilleurs !)',
    'La collectionneuse de 1': 'La spécialiste des échecs critiques - accumule les résultats de 1 (mais ça arrive aux meilleures !)',
    
    // Tranches et styles
    'Le high roller': 'L\'amateur de gros scores - excelle dans les hauts résultats (18-19-20) comme dans un casino',
    'La high roller': 'L\'amatrice de gros scores - excelle dans les hauts résultats (18-19-20) comme dans un casino',
    'Le maître du milieu': 'L\'expert de la zone de confort - trouve son équilibre dans les résultats moyens (9-12)',
    'La maîtresse du milieu': 'L\'experte de la zone de confort - trouve son équilibre dans les résultats moyens (9-12)',
    'Le safe player': 'Le joueur prudent - évite les catastrophes en limitant les très mauvais résultats (≤3)',
    'La safe player': 'La joueuse prudente - évite les catastrophes en limitant les très mauvais résultats (≤3)',
    
    // Comportements de jeu
    'Tout ou rien': 'Le joueur extrême - vit dangereusement entre échecs cuisants et réussites brillantes, sans demi-mesure',
    'Maître zen': 'Le sage de l\'équilibre - privilégie la stabilité avec des résultats modérés mais constants (8-13)',
    'Maîtresse zen': 'La sage de l\'équilibre - privilégie la stabilité avec des résultats modérés mais constants (8-13)',
    
    // Consistance
    'Mr Régularité': 'Le métronome du groupe - ses résultats sont prévisibles avec très peu de variation',
    'Mme Régularité': 'Le métronome du groupe - ses résultats sont prévisibles avec très peu de variation',
    'Chaos incarné': 'L\'imprévisible - ses jets sont un mystère total, oscillant entre tous les extrêmes possibles',
    
    // Perfectionnisme et progression
    'Le perfectionniste': 'Le théoricien parfait - sa moyenne se rapproche de l\'idéal mathématique (10,5 sur un D20)',
    'La perfectionniste': 'La théoricienne parfaite - sa moyenne se rapproche de l\'idéal mathématique (10,5 sur un D20)',
    'Most improved': 'La révélation - ce joueur a progressé de manière spectaculaire au fil des séances',
    
    // Le boulet sympathique
    'Boulet attachant': 'Le joueur au grand cœur - ses stats ne sont pas terribles mais on l\'adore quand même !',
    'Boulet attachante': 'La joueuse au grand cœur - ses stats ne sont pas terribles mais on l\'adore quand même !'
  };
  
  // Pour les spécialistes d'un type de jet
  if (title.includes('maître ') || title.includes('maîtresse ')) {
    const typeJet = title.split(' ').slice(1).join(' ');
    return `Véritable spécialiste des jets de "${typeJet}" - plus de 40% de son activité se concentre sur ce type de lancer`;
  }
  
  return tooltips[title] || `Champion dans la catégorie "${title}" - statistique calculée selon les performances de jeu`;
}; 