import React, { useState, useMemo } from 'react';
import Tooltip from 'antd/lib/tooltip';
import type { ColumnType } from 'antd/lib/table';
import { StyledTable as TableStyled } from '../styles';

interface Jet {
  joueur: string;
  typeJet: string;
  resultat: number;
  date?: string;
}

interface TableauJetsParResultatProps {
  jets: Jet[];
  size?: 'small' | 'middle' | 'large';
  scroll?: { x?: string | number | true; y?: number | string };
}

export default function TableauJetsParResultat({ jets, size = 'middle', scroll }: TableauJetsParResultatProps) {
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: string} | null>(null);

  // Calculer le tableau des jets par résultat
  const tableauJets = useMemo(() => {
    if (!jets || jets.length === 0) return [];
    
    const joueurs = [...new Set(jets.map(jet => jet.joueur))];
    const tableau = [];
    
    for (let resultat = 1; resultat <= 20; resultat++) {
      const ligne: any = { resultat };
      joueurs.forEach(joueur => {
        const count = jets.filter(jet => jet.joueur === joueur && jet.resultat === resultat).length;
        ligne[joueur] = count || 0;
      });
      tableau.push(ligne);
    }
    
    return tableau;
  }, [jets]);

  // Calculer la valeur maximale pour la normalisation des couleurs
  const valeurMax = useMemo(() => {
    if (tableauJets.length === 0) return 1;
    
    let max = 0;
    tableauJets.forEach(ligne => {
      Object.keys(ligne).forEach(key => {
        if (key !== 'resultat' && ligne[key] > max) {
          max = ligne[key];
        }
      });
    });
    
    return max || 1; // Éviter la division par zéro
  }, [tableauJets]);

  // Fonction pour calculer la couleur basée sur la valeur
  const obtenirCouleurCellule = (valeur: number): string => {
    if (valeur === 0) return 'transparent';
    
    // Normaliser la valeur entre 0 et 1
    const ratio = valeur / valeurMax;
    
    // Créer un dégradé bleu du foncé au clair
    const hue = 220; // Teinte bleue fixe
    const saturation = Math.max(60, 80 - ratio * 20); // Saturation qui diminue légèrement
    const lightness = 30 + ratio * 45; // Luminosité de 30% (foncé) à 75% (clair)
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Fonction pour calculer la répartition des jets par type
  const calculerRepartitionJets = (joueur: string, resultat: number) => {
    if (!jets) return '';
    
    const jetsFiltre = jets.filter(
      jet => jet.joueur === joueur && jet.resultat === resultat
    );
    
    if (jetsFiltre.length === 0) return '';
    
    // Compter les jets par type
    const compteurTypes: { [key: string]: number } = {};
    jetsFiltre.forEach(jet => {
      compteurTypes[jet.typeJet] = (compteurTypes[jet.typeJet] || 0) + 1;
    });
    
    // Créer le contenu du tooltip
    const lignes = Object.entries(compteurTypes)
      .sort(([,a], [,b]) => b - a) // Trier par nombre décroissant
      .map(([type, count]) => `${count}x ${type}`);
    
    return lignes.join('\n');
  };

  // Définir les colonnes du tableau
  const colonnes = useMemo(() => {
    if (!jets || jets.length === 0) return [];
    
    const joueurs = [...new Set(jets.map(jet => jet.joueur))];
    
    return [
      {
        title: 'Résultat',
        dataIndex: 'resultat',
        key: 'resultat',
        fixed: 'left' as const,
        width: 5,
        align: 'center' as const,
        onCell: (record: any) => {
          const isResultatHovered = hoveredCell?.row === record.resultat - 1;
          return {
            'data-resultat-hover': isResultatHovered,
            style: {
              color: isResultatHovered ? 'white' : 'var(--text-primary)',
              backgroundColor: isResultatHovered ? '#FF69B4' : 'transparent',
              transition: 'all 0.2s ease'
            } as React.CSSProperties
          };
        },
        render: (value: number) => <div>{value}</div>
      },
      ...joueurs.map(joueur => {
        const colonneJoueur: ColumnType<any> = {
          title: <div>{joueur}</div>,
          dataIndex: joueur,
          key: joueur,
          align: 'center' as const,
          width: 25,
          onCell: (record: any) => {
            const value = record[joueur];
            const isHovered = hoveredCell && (hoveredCell.row === record.resultat - 1 && hoveredCell.col === joueur);
            const couleurFond = obtenirCouleurCellule(value);
            
            return {
              'data-hover': isHovered,
              'data-couleur': value > 0,
              style: {
                '--couleur-cellule': couleurFond,
                color: isHovered ? 'white' : (value > 0 ? (value / valeurMax > 0.6 ? 'white' : 'var(--text-dark)') : 'var(--text-secondary)'),
                fontWeight: value > 0 ? 600 : 400,
                cursor: value > 0 ? 'pointer' : 'default',
                background: isHovered ? '#FF69B4 !important' : (value > 0 ? couleurFond : 'transparent'),
                transition: 'all 0.2s ease'
              } as React.CSSProperties,
              onMouseEnter: () => setHoveredCell({row: record.resultat - 1, col: joueur}),
              onMouseLeave: () => setHoveredCell(null)
            };
          },
          onHeaderCell: () => ({
            'data-hover': hoveredCell?.col === joueur,
            onMouseEnter: () => setHoveredCell(prev => prev ? {row: prev.row, col: joueur} : null),
            onMouseLeave: () => setHoveredCell(prev => prev ? {row: prev.row, col: joueur} : null)
          }),
          render: (value: number, record: any) => {
            const contenuTooltip = calculerRepartitionJets(joueur, record.resultat);
            const lignesFormatees = contenuTooltip ? contenuTooltip.split('\n').map((ligne, idx) => (
              <div key={idx}>{ligne}</div>
            )) : null;

            return (
              <Tooltip
                title={lignesFormatees}
                trigger="click"
                placement="top"
              >
                {value > 0 ? value : '-'}
              </Tooltip>
            );
          }
        };
        return colonneJoueur;
      })
    ];
  }, [jets, hoveredCell, valeurMax, obtenirCouleurCellule]);

  if (tableauJets.length === 0) {
    return null;
  }

  return (
    <TableStyled
      $valeurMax={valeurMax}
      $hoveredCell={hoveredCell}
      $jets={jets}
      columns={colonnes}
      dataSource={tableauJets}
      pagination={false}
      scroll={scroll || { x: true }}
      rowKey="resultat"
      size={size}
    />
  );
} 