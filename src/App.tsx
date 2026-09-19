import { AppProvider, useApp } from './context';
import { MobileContainer } from './components/layout/MobileContainer';
import { HomeScreen } from './components/home/HomeScreen';
import { RequestScreen } from './components/requests/RequestScreen';
import { ProjectList } from './components/projects/ProjectList';
import { FilesExplorer } from './components/files/FilesExplorer';

const MainRouter: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'Home':
      return <HomeScreen />;
    case 'Requests':
      return <RequestScreen />;
    case 'Projects':
      return <ProjectList />;
    case 'Files':
      return <FilesExplorer />;
    default:
      return <HomeScreen />;
  }
};

export function App() {
  return (
    <AppProvider>
      <MobileContainer>
        <MainRouter />
      </MobileContainer>
    </AppProvider>
  );
}

export default App;
