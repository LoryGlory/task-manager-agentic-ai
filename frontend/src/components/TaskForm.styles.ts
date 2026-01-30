/**
 * TaskForm component styles.
 * Separated styling using MUI styled API.
 */
import { styled } from '@mui/material/styles';
import { DialogTitle, Box } from '@mui/material';

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: theme.palette.common.white,
  fontWeight: 700,
}));

export const FormContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  paddingTop: theme.spacing(2),
}));

export const CharCounter = styled(Box)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  textAlign: 'right',
  marginTop: theme.spacing(0.5),
}));
