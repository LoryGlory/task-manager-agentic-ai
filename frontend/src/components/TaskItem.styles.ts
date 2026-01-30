/**
 * TaskItem component styles.
 * Separated styling using MUI styled API.
 */
import { styled } from '@mui/material/styles';
import { Card, Box } from '@mui/material';

interface StyledCardProps {
  isOverdue?: boolean;
}

export const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isOverdue',
})<StyledCardProps>(({ theme, isOverdue }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: isOverdue ? '2px solid' : '1px solid',
  borderColor: isOverdue ? theme.palette.error.main : theme.palette.divider,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    borderColor: isOverdue ? theme.palette.error.main : theme.palette.primary.main,
  },
}));

export const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem',
});

export const ActionsBox = styled(Box)({
  display: 'flex',
  gap: '0.25rem',
});

export const selectStyles = {
  minWidth: 140,
};

export const titleStyles = (isDone: boolean) => ({
  textDecoration: isDone ? 'line-through' : 'none',
  color: isDone ? 'text.secondary' : 'text.primary',
  fontWeight: 600,
  fontSize: '1.125rem',
});

export const MetadataBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  marginTop: theme.spacing(2),
}));
