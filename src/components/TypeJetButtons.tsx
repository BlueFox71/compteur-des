import type { TypeJet } from '../context/AppReducer';
import { FlexContainer, TypeJetButton } from '../styles';

interface TypeJetButtonsProps {
  types: TypeJet[];
  selected: string | undefined;
  onSelect: (type: string) => void;
}

export default function TypeJetButtons({ types, selected, onSelect }: TypeJetButtonsProps) {
  return (
    <FlexContainer $direction="row" $align="center" $gap="6px" style={{ flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      {types.map((type) => (
        <TypeJetButton
          key={type.type}
          $selected={selected === type.type}
          onClick={() => onSelect(type.type)}
          className="compact-btn"
        >
          {type.type}
        </TypeJetButton>
      ))}
    </FlexContainer>
  );
} 