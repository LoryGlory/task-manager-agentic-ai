/**
 * Main App component with Material UI theme provider.
 * AI-generated application entry point.
 */
import { CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, Box } from '@mui/material';
import TaskIcon from '@mui/icons-material/Assignment';
import TaskList from './components/TaskList';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <TaskIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
              Task Manager
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content - grows to fill available space */}
        <Box sx={{ flex: 1, bgcolor: 'background.default', py: 4 }}>
          <TaskList />
        </Box>

        {/* Footer - fixed at bottom */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Agentic AI study project created by{' '}
            <Box
              component="a"
              href="https://www.linkedin.com/in/laura-roganovic/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Laura Roganovic
            </Box>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
