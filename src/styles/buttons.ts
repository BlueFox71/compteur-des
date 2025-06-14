import styled from 'styled-components';
import { theme } from './theme';

export const ButtonGrid = styled.div<{ $columns?: number; $minWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 'auto-fit'}, minmax(${props => props.$minWidth || '120px'}, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

export const CustomButton = styled.button<{ 
  $selected?: boolean; 
  $variant?: 'primary' | 'secondary' | 'success' | 'danger';
  $size?: 'small' | 'medium' | 'large';
}>`
  background: ${props => {
    if (props.$selected) return theme.colors.primary;
    switch (props.$variant) {
      case 'success': return '#52c41a';
      case 'danger': return '#ff4d4f';
      default: return theme.colors.background.tertiary;
    }
  }};
  
  border: 1px solid ${props => {
    if (props.$selected) return theme.colors.primary;
    switch (props.$variant) {
      case 'success': return '#52c41a';
      case 'danger': return '#ff4d4f';
      default: return theme.colors.border;
    }
  }};
  
  color: ${props => {
    if (props.$selected || props.$variant === 'success' || props.$variant === 'danger') {
      return 'white';
    }
    return theme.colors.text.primary;
  }};
  
  padding: ${props => {
    switch (props.$size) {
      case 'small': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'large': return `${theme.spacing.lg} ${theme.spacing.xl}`;
      default: return `${theme.spacing.md} ${theme.spacing.lg}`;
    }
  }};
  
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fonts.weights.semibold};
  cursor: pointer;
  transition: ${theme.transitions.medium};
  min-height: 40px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    
    ${props => !props.$selected && !props.$variant && `
      background: ${theme.colors.background.secondary};
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primary};
    `}
  }
`;

export const TypeJetButton = styled(CustomButton)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
  font-size: ${theme.fonts.sizes.sm};
`;

export const PlayerButton = styled(CustomButton)`
  font-size: ${theme.fonts.sizes.md};
  font-weight: ${theme.fonts.weights.bold};
`;

export const ResultButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.sm};
`;

export const ResultButton = styled(CustomButton)`
  font-size: ${theme.fonts.sizes.md};
  font-weight: ${theme.fonts.weights.bold};
  min-width: 80px;
  min-height: 48px;
`; 