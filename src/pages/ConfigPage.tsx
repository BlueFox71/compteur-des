import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserAddOutlined, 
  DatabaseOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { 
  PageContainer, 
  StyledCard, 
  StyledTitle, 
  StyledText, 
  GridContainer,
  FlexContainer 
} from '../styles';

interface ParametreCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export default function ConfigPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Compteur de dés - Paramètres';
  }, []);

  const parametreCards: ParametreCard[] = [
    {
      title: 'Joueurs & Types de Jets',
      description: 'Gérer la liste des joueurs et les types de jets disponibles',
      icon: <UserAddOutlined style={{ fontSize: '32px' }} />,
      color: '#1D3461',
      path: '/joueurs-types'
    },
    {
      title: 'Campagnes & Séances',
      description: 'Organiser vos aventures par campagnes et visualiser les séances',
      icon: <FolderOutlined style={{ fontSize: '32px' }} />,
      color: '#ff69b4',
      path: '/campagnes-seances'
    },
    {
      title: 'Données',
      description: 'Gestion des séances, import/export, sauvegarde',
      icon: <DatabaseOutlined style={{ fontSize: '32px' }} />,
      color: '#ED8936',
      path: '/donnees'
    }
  ];

  return (
    <PageContainer style={{ flexDirection: 'column', maxWidth: '1000px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <StyledTitle level={1} style={{ fontSize: '36px', marginBottom: '8px' }}>
          ⚙️ Paramètres
        </StyledTitle>
      </div>

      {/* Cartes de paramètres */}
      <GridContainer className="ConfigPage__grid" $minWidth="400px" $gap="24px">
        {parametreCards.map((parametre, index) => (
          <StyledCard 
            key={index} 
            style={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              padding: '32px',
              height: 'auto'
            }}
            onClick={() => navigate(parametre.path)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FlexContainer $direction="column" $align="center" $gap="20px">
              <div style={{ color: parametre.color }}>
                {parametre.icon}
              </div>
              <div style={{ textAlign: 'center' }}>
                <StyledText $size="lg" $weight="bold" $block style={{ marginBottom: '8px' }}>
                  {parametre.title}
                </StyledText>
                <StyledText $color="secondary" style={{ lineHeight: '1.5' }}>
                  {parametre.description}
                </StyledText>
              </div>
            </FlexContainer>
          </StyledCard>
        ))}
      </GridContainer>
    </PageContainer>
  );
} 