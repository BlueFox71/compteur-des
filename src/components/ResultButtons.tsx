import { FlexContainer, ResultButton } from '../styles';

interface ResultButtonsProps {
  selected: number | null;
  onSelect: (value: number | null) => void;
}

export default function ResultButtons({ selected, onSelect }: ResultButtonsProps) {
  return (
    <FlexContainer $direction="row" $align="center" $gap="6px" style={{ flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      {Array.from({ length: 20 }, (_, i) => {
        const value = i + 1;
        const isSelected = selected === value;
        return (
          <ResultButton
            key={value}
            type="button"
            $selected={isSelected}
            onClick={() => onSelect(isSelected ? null : value)}
            className="compact-btn"
          >
            {value}
          </ResultButton>
        );
      })}
    </FlexContainer>
  );
} 