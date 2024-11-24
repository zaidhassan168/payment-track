import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Payments", href: "/dashboard/payments" },
  { name: "Projects", href: "/dashboard/projects" },
  { name: "Settings", href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md h-full flex flex-col">
      <div className="p-4 font-bold text-lg">My Dashboard</div>
      <nav className="flex flex-col flex-grow">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`p-4 text-sm font-medium ${
              pathname === item.href ? "bg-gray-200 text-black" : "text-gray-600"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
