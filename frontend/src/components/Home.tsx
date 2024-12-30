import { Button } from "./ui/button";
import { StarFilledIcon } from "@radix-ui/react-icons";
import Reviews from "./Reviews";
import Query from "./Query";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div>
        <div className="flex justify-center flex-col items-center mt-[170px]">
          <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-5xl font-Montserrat text-center">
            <span className="text-[#1e3a8a]">Connect-Wave</span> best place{" "}
            <br /> for Random talks
          </h1>
          <div className="flex p-5">
            {Array.from({ length: 5 }).map(() => (
              <StarFilledIcon
                className="cursor-pointer"
                color="#d97706"
                width={30}
                height={30}
              />
            ))}
          </div>
          <Button
            className="text-lg p-6 font-Montserrat w-[200px]"
            onClick={() => navigate("/start")}
          >
            Get Started
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-[200px]">
        <h2 className="scroll-m-20  pb-2 text-3xl font-semibold tracking-tight first:mt-0 font-Montserrat">
          Reviews
        </h2>
        <div className="mt-10">
          <Reviews />
        </div>
      </div>
      <div>
        <Query />
      </div>
    </div>
  );
};

export default Home;
