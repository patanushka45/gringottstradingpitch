export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto bg-[#1a0505] border-t border-amber-900/50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-amber-300/70 mb-3 md:mb-0">
            © {currentYear} Gringotts Market Vault. All rights reserved.
          </div>
          <div className="text-xs text-amber-300/50 italic">
            "Fortunes made with magic, tracked with precision"
          </div>
        </div>
      </div>
    </footer>
  );
}
