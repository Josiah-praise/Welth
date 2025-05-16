
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboardIcon, LogIn, LogOut, PenBoxIcon } from "lucide-react";
import { checkPersistence } from "@/lib/checkUser";

async function Header() {
    await checkPersistence();
    
  return (
    <div className=" w-[95%] mx-auto">
      <nav className="flex justify-between items-center">
        <div>
          <Link href="/">
            <Image
              src={"/images/logo.png"}
              alt="Company Logo"
              height={1217}
              width={556}
              priority
              className="w-[100px] h-auto"
            />
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <SignedIn>
            <Link href={"/transaction/create"}>
              <Button variant={"outline"}>
                <PenBoxIcon />
                <span className="hidden md:inline">Add transaction</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedIn>
            <Link href={"/dashboard"}>
              <Button>
                <LayoutDashboardIcon />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "!w-9 !h-9" } }} />
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl={"/"}>
              <Button variant={"outline"}>
                <LogIn />
                <span className="hidden md:inline">Login</span>
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </div>
  );
}
export default Header;
