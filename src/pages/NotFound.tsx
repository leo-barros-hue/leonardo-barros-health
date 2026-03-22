import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">Página não encontrada</p>
        <Button asChild className="rounded-[10px]">
          <a href="/">Voltar ao Início</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
