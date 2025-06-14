import styled from 'styled-components';
import Card from 'antd/lib/card';
import Button from 'antd/lib/button';
import Typography from 'antd/lib/typography';
import Divider from 'antd/lib/divider';
import { theme } from './theme';

// Layout containers
export const PageContainer = styled.div`
  padding-top: ${theme.spacing.xl};
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
`;

export const StyledCard = styled(Card)<{ $width?: string; $flex?: string }>`
  margin-bottom: ${theme.spacing.xl};
  width: 100%;
  ${props => props.$flex && `flex: ${props.$flex};`}
  ${props => props.$width && `width: ${props.$width};`}
`;

// Grid layouts
export const GridContainer = styled.div<{ $minWidth?: string; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${props => props.$minWidth || '200px'}, 1fr));
  gap: ${props => props.$gap || theme.spacing.md};
`;

export const FlexContainer = styled.div<{ 
  $direction?: 'row' | 'column';
  $justify?: string;
  $align?: string;
  $gap?: string;
  $wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  ${props => props.$justify && `justify-content: ${props.$justify};`}
  ${props => props.$align && `align-items: ${props.$align};`}
  ${props => props.$gap && `gap: ${props.$gap};`}
  ${props => props.$wrap && 'flex-wrap: wrap;'}
`;

// Typography
export const StyledTitle = styled(Typography.Title)<{ $level?: 1 | 2 | 3 | 4 | 5 }>`
  &.ant-typography {
    color: ${theme.colors.primary} !important;
    margin: 0 !important;
    text-align: center;
    letter-spacing: 1px;
    font-size: ${props => 
      props.$level === 3 ? theme.fonts.sizes.xl : 
      props.$level === 4 ? theme.fonts.sizes.lg : 
      theme.fonts.sizes.xxl
    } !important;
    margin-bottom: ${theme.spacing.lg} !important;
  }
`;

export const StyledText = styled(Typography.Text)<{ 
  $color?: 'primary' | 'secondary' | 'dark';
  $size?: 'xs' | 'sm' | 'md' | 'lg';
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  $block?: boolean;
}>`
  color: ${props => {
    switch (props.$color) {
      case 'primary': return theme.colors.text.primary;
      case 'secondary': return theme.colors.text.secondary;
      case 'dark': return theme.colors.text.dark;
      default: return theme.colors.text.primary;
    }
  }} !important;
  
  ${props => props.$size && `font-size: ${theme.fonts.sizes[props.$size as keyof typeof theme.fonts.sizes]} !important;`}
  ${props => props.$weight && `font-weight: ${theme.fonts.weights[props.$weight as keyof typeof theme.fonts.weights]} !important;`}
  ${props => props.$block && 'display: block !important;'}
`;

// Buttons
export const StyledButton = styled(Button)<{ $variant?: 'primary' | 'secondary' }>`
  &.ant-btn {
    transition: ${theme.transitions.medium};
    border-radius: ${theme.borderRadius.md};
    font-weight: ${theme.fonts.weights.semibold};
    
    ${props => props.$variant === 'secondary' && `
      background: ${theme.colors.background.tertiary};
      border-color: ${theme.colors.border};
      color: ${theme.colors.text.primary};
      
      &:hover {
        background: ${theme.colors.background.secondary} !important;
        border-color: ${theme.colors.primary} !important;
        color: ${theme.colors.primary} !important;
      }
    `}
  }
`;

// Dividers
export const StyledDivider = styled(Divider)`
  &.ant-divider {
    border-color: ${theme.colors.background.tertiary};
    margin: ${theme.spacing.xl} 0 ${theme.spacing.lg} 0;
  }
`;

// Cards and containers with hover effects
export const HoverCard = styled.div<{ $selected?: boolean }>`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  text-align: center;
  transition: ${theme.transitions.medium};
  cursor: pointer;
  
  ${props => props.$selected && `
    background: ${theme.colors.primary};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.text.dark};
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.medium};
    ${props => !props.$selected && `
      background: ${theme.colors.background.secondary};
      border-color: ${theme.colors.primary};
    `}
  }
`;

// Stats card component
export const StatsCard = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  text-align: center;
  transition: ${theme.transitions.medium};
`;

// Form section wrapper
export const FormSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

// Responsive breakpoints helper
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1800px',
};

export const mediaQuery = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  wide: `@media (min-width: ${breakpoints.wide})`,
}; 