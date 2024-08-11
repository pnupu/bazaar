import { type FC, type ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface Props {
    children: ReactNode;
}
const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <div className="bg-[#eeeeee] bg-gypsum overflow-hidden flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50 sm:static sm:z-auto">
          <Header />
        </div>
        <div className="pt-14 sm:pt-[1px] pt-[66px] justify-center">
          <div className="mx-auto space-y-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
