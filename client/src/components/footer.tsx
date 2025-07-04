import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h4 className="text-2xl font-bold text-primary-400 mb-4">EventMarket</h4>
            <p className="text-gray-300 mb-4">
              La plataforma líder para conectar proveedores de servicios para eventos con clientes que buscan experiencias únicas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Para Clientes</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white transition duration-200">
                  Buscar Servicios
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition duration-200">
                  Categorías
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Reseñas
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Para Proveedores</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/register-provider" className="text-gray-400 hover:text-white transition duration-200">
                  Registrar Negocio
                </Link>
              </li>
              <li>
                <a href="#plans" className="text-gray-400 hover:text-white transition duration-200">
                  Planes y Precios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Mejores Prácticas
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Comunidad
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Empresa</h5>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Prensa
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Términos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  Privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 EventMarket. Todos los derechos reservados.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400">Contáctanos:</span>
              <a href="mailto:info@eventmarket.com" className="text-gray-400 hover:text-white transition duration-200 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                info@eventmarket.com
              </a>
              <a href="tel:+541154321000" className="text-gray-400 hover:text-white transition duration-200 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                +54 11 5432-1000
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
