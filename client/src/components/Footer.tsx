export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto bg-white border-t border-neutral-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-neutral-600 mb-3 md:mb-0">
            © {currentYear} MarketPulse. All rights reserved.
          </div>
          <div className="text-xs text-neutral-500">
            Data provided for informational purposes only. Not financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
