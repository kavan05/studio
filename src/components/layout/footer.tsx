export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 md:px-6 py-6 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} BizHub API. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
