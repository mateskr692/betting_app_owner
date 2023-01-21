import './App.css';
import { useClient } from './Scripts.tsx';

function App() {
  return (
    <div className="App">
      <button onClick={useClient()}>
        Get program
      </button>
    </div>
  );
}

export default App;
