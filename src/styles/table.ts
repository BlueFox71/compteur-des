import styled from 'styled-components';
import Table from 'antd/lib/table';
import { theme } from './theme';

export const StyledTable = styled(Table)<{ 
  $valeurMax: number;
  $hoveredCell: {row: number, col: string} | null;
  $jets: any[];
}>`
  .ant-table-thead > tr > th {
    background-color: var(--background-tertiary) !important;
    color: var(--text-primary) !important;
    font-weight: 600 !important;
    border-bottom: 1px solid var(--border-color) !important;
    padding: 2px !important;
    text-align: center !important;
    transition: all 0.2s ease;

    &[data-hover="true"] {
      background-color: #FF69B4 !important;
      color: white !important;
    }
  }

  .ant-table-tbody > tr > td {
    padding: 2px !important;
    text-align: center !important;
    transition: all 0.2s ease;

    &[data-couleur="true"] {
      background-color: var(--couleur-cellule) !important;
      color: var(--text-primary) !important;
      font-weight: 600 !important;
    }

    &[data-hover="true"] {
      background-color: #FF69B4 !important;
      color: white !important;
      transform: scale(1.1);
      z-index: 1;
    }

    &[data-resultat-hover="true"] {
      background-color: #FF69B4 !important;
      color: white !important;
    }
  }

  .ant-table-tbody > tr:hover > td {
    background-color: transparent !important;
  }

  .ant-table-cell:hover {
    background-color: transparent !important;
  }

  .ant-tooltip {
    .ant-tooltip-inner {
      background-color: var(--background-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--primary-color);
      border-radius: 6px;
      padding: 8px 12px;
    }
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background.secondary};
  
  .ant-table {
    background: transparent;
  }
  
  .ant-table-container {
    border-radius: ${theme.borderRadius.lg};
  }
`;

export const TableSection = styled.div`
  margin-top: ${theme.spacing.xl};
`;

export const CollapseTableContainer = styled.div`
  .ant-collapse {
    background-color: ${theme.colors.background.secondary};
    border: 1px solid ${theme.colors.background.tertiary};
    border-radius: ${theme.borderRadius.lg};
    
    .ant-collapse-header {
      background: ${theme.colors.background.tertiary} !important;
      color: ${theme.colors.text.primary} !important;
      font-weight: ${theme.fonts.weights.semibold} !important;
      border-radius: ${theme.borderRadius.md} !important;
    }
    
    .ant-collapse-content {
      background: ${theme.colors.background.secondary} !important;
      border-top: 1px solid ${theme.colors.background.tertiary};
    }
    
    .ant-collapse-content-box {
      padding: ${theme.spacing.lg} !important;
    }
  }
`; 