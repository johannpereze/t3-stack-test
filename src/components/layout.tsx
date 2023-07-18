import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { type PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ModeToggle } from "./modeToggle";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export const PageLayout = (props: PropsWithChildren) => {
  const { isSignedIn } = useUser();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Top menu container fixed to the top of the page */}
      <header className="fixed  left-0 right-0 top-0 z-10 flex justify-center bg-background px-4">
        <div className="flex h-20 w-full max-w-2xl items-center justify-between ">
          <div>
            <Link href="/">
              <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-5xl">
                trinom
                <span className="text-xl font-extrabold tracking-tight lg:text-4xl">
                  🙃
                </span>
                ji
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {!isSignedIn ? (
              <Button asChild>
                <SignInButton />
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <SignOutButton />
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="h-20 w-full" />
      <Separator />
      <main className="flex justify-center">
        <div className="w-full md:max-w-2xl">{props.children}</div>
      </main>
    </ThemeProvider>
  );
};
