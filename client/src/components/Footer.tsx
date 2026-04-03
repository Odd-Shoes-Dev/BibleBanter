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
      </div>
    </footer>
  );
};

export default Footer;
