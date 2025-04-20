import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 sm:px-8">
      <div className="flex-1">
        <Link href="/" className=" font-bold  text-xl">
          <span className="text-primary">Chained</span>
          <span className="text-secondary">_Review</span>
        </Link>
      </div>

      <div className="flex-none hidden md:block">
        <ul className="menu menu-horizontal px-1 space-x-2">
          <li>
            <Link href="/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/create" className="hover:text-primary">
              New Review
            </Link>
          </li>
          <li>
            <Link href="/explore" className="hover:text-primary">
              Explore
            </Link>
          </li>
        </ul>
      </div>

      <div className="flex-none ml-4">
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </div>
  );
};

export default Header;
