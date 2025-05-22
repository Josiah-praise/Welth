import { Plus } from "lucide-react";
import CreateAccountDrawer from "./CreateAccountDrawer"
import { Card, CardContent } from "./ui/card";

function CreateAccount() {
  return (
    <CreateAccountDrawer>
      <Card className="hover:shadow-md mx-2 cursor-pointer border-2 transition-shadow border-dashed flex flex-col justify-center">
        <CardContent className=" flex gap-3 flex-col justify-center items-center">
          <Plus size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm font-medium">
            Add a new account
          </p>
        </CardContent>
      </Card>
    </CreateAccountDrawer>
  );
}
export default CreateAccount