import { type PropsWithChildren } from "react";
import { ThemeProvider } from "./ThemeProvider";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
          {props.children}
        </div>
      </main>
    </ThemeProvider>
  );
};
