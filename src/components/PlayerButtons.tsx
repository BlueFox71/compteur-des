import type { Joueur } from '../context/AppReducer';
import { FlexContainer, PlayerButton } from '../styles';

interface PlayerButtonsProps {
  joueurs: Joueur[];
  selected: string | undefined;
  onSelect: (nom: string) => void;
}

export default function PlayerButtons({ joueurs, selected, onSelect }: PlayerButtonsProps) {
  return (
    <FlexContainer $direction="row" $align="center" $gap="6px" style={{ flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      {joueurs.map((joueur) => (
        <PlayerButton
          key={joueur.nom}
          $selected={selected === joueur.nom}
          onClick={() => onSelect(joueur.nom)}
          className="compact-btn"
        >
          {joueur.nom}
        </PlayerButton>
      ))}
    </FlexContainer>
  );
} 