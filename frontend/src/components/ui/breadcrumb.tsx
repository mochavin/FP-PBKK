"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-500 mx-6 mt-6">
      <ul className="flex items-center space-x-2">
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;

          return (
            <li key={href} className="flex items-center space-x-2">
              <span>/</span>
              {isLast ? (
                <span className="text-gray-700">
                  {decodeURIComponent(segment)}
                </span>
              ) : (
                <Link href={href} className="text-blue-500 hover:underline">
                  {decodeURIComponent(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
