import logo from "../assets/logo.png";

export function Footer() {
  return (
    <footer className="mt-16 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ChiFacademy" className="h-12 w-12 rounded-full bg-white object-contain" />
          <div>
            <p className="font-bold">ChiFacademy</p>
            <p className="text-sm text-navy-100">Comunidad educativa para aprender, compartir y crecer.</p>
          </div>
        </div>
        <p className="text-sm text-navy-100">© 2026 ChiFacademy. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
