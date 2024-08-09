import { type FC, type ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface Props {
    children: ReactNode;
}
const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <div className="bg-gypsum overflow-hidden flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50 sm:static sm:z-auto">
          <Header />
        </div>
        <div className="flex-grow pt-8 sm:pt-0">
          <div className="px-4 py-16 max-w-7xl mx-auto space-y-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
