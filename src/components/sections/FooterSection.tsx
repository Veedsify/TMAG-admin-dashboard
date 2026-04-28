const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "https://tmag.health/privacy" },
    { label: "Terms of Service", href: "https://tmag.health/terms" },
];

const FooterSection = () => {
    return (
        <footer className="border-t border-border-light mt-8">
            <div className="px-4 sm:px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl">
                <p className="text-xs text-muted">
                    © {new Date().getFullYear()} TMAG · Travel Medicine Advisory
                    Global. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    {LEGAL_LINKS.map((link, i) => (
                        <span key={link.label} className="flex items-center gap-4">
                            {i > 0 && <span className="text-border-light">·</span>}
                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted hover:text-heading transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        </span>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
