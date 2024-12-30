import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const {theme,setTheme} = useTheme();
    const navigate = useNavigate();
  return (
    <>
      <div className="flex justify-between items-center max-w-5xl m-auto p-2">
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight font-Montserrat cursor-pointer" onClick={()=>navigate("/")}>
            Connect-Wave
          </h4>
        </div>
        <div className="flex items-center gap-5">
          <Button>Get started</Button>
          {theme == "dark" ? (
            <SunIcon onClick={() => setTheme("light")} />
          ) : (
            <MoonIcon onClick={() => setTheme("dark")} />
          )}
        </div>
      </div>
      <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700"></hr>
    </>
  );
};

export default Header;
