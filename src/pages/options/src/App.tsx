import { FC, Suspense } from "react";
import FontProvider from "@src/shared/component/FontProvider";
import StyleProvider from "@src/shared/component/StyleProvider";
import InitZone from "./pages/Zone";

const App: FC = () => {
  return (
    <FontProvider>
      <StyleProvider isDark={true}>
        <Suspense fallback={<div>...loading</div>}>
          <InitZone />
        </Suspense>
      </StyleProvider>
    </FontProvider>
  );
};

export default App;
