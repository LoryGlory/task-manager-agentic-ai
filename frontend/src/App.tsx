/**
 * Main App component with Material UI theme provider.
 * AI-generated application entry point.
 */
import { CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Box } from '@mui/material';
import TaskIcon from '@mui/icons-material/Assignment';
import TaskList from './components/TaskList';

// Create Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <TaskIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Task Manager
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
        <TaskList />
      </Box>
    </ThemeProvider>
  );
}

export default App;
