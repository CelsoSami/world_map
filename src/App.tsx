import { WorldMapHtml } from "@/worldMapHtml";

function App() {
  return (
    <div className="w-full h-screen">
      <iframe
        title="World Map Visual"
        srcDoc={WorldMapHtml()}
        className="w-full h-full border-0"
      />
    </div>
  );
}

export default App;
