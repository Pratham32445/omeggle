import { Input } from "./ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";

const Query = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-[100px]">
      <div>
        <h2 className="scroll-m-20  pb-2 text-3xl font-semibold tracking-tight first:mt-0 font-Montserrat">
          For Any Query
        </h2>
      </div>
      <div className="p-5">
        <div className="p-5 flex flex-col gap-7">
          <Input type="email" placeholder="Email" className="w-[500px]" />
          <div className="grid w-full gap-5">
            <Textarea placeholder="Type your message here." />
            <Button>Send message</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Query;
