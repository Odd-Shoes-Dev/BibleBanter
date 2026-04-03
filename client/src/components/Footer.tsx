import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-10 bg-background border-t border-border">
      <div className="container mx-auto px-4 text-center space-y-4">
        <p className="font-body text-base text-muted-foreground">
          Built by{" "}
          <a
            href="https://www.oddshoes.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent transition-colors font-bold"
          >
            Odd Shoes
          </a>{" "}
          in partnership with{" "}
          <a
            href="https://betweenhisshoulders.org/services/kingdom-tech-hubs/kc-labs-software-development"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent transition-colors font-bold"
          >
            Kingdom Chaplain
          </a>
        </p>
        <div className="flex items-center justify-center gap-4 text-sm font-body text-muted-foreground/80">
          <a
            href="https://www.oddshoes.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            oddshoes.dev
          </a>
          <span>&middot;</span>
          <a
            href="https://betweenhisshoulders.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            betweenhisshoulders.org
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
