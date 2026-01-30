/**
 * TaskList component styles.
 * Separated styling using MUI styled API.
 */
import { styled } from '@mui/material/styles';
import { Box, TextField } from '@mui/material';

export const StyledContainer = styled(Box)({
  paddingTop: '2rem',
  paddingBottom: '2rem',
});

export const HeaderBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const GradientTitle = styled('h1')(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2.125rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
  margin: 0,
}));

export const FiltersContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const FiltersRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const TasksGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
}));

export const fabStyles = {
  position: 'fixed' as const,
  bottom: 78,
  right: 32,
};
