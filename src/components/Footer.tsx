const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-2xl tracking-wider text-primary mb-4">AUREUM</h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Premium bespoke menswear, reimagined through technology.
            </p>
          </div>
          {[
            { title: "Shop", links: ["Suits", "Blazers", "Shirts", "Overcoats"] },
            { title: "Services", links: ["3D Customization", "Body Mapping", "Bespoke Orders", "Alterations"] },
            { title: "Company", links: ["About", "Contact", "Careers", "Press"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-body text-xs tracking-widest uppercase text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">© 2026 AUREUM. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((link) => (
              <a key={link} href="#" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
