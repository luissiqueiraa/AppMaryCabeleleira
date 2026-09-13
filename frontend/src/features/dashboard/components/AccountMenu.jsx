import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiUser, FiLogOut } from "react-icons/fi";
import Avatar from "../../../shared/components/Avatar";

const PANEL_WIDTH = 240;
const PANEL_MARGIN = 12;

export default function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(PANEL_WIDTH, window.innerWidth - PANEL_MARGIN * 2);
      const left = Math.min(
        Math.max(PANEL_MARGIN, rect.right + window.scrollX - width),
        window.innerWidth - width - PANEL_MARGIN
      );
      setPosition({ top: rect.bottom + window.scrollY + 8, left, width });
    }
    updatePosition();

    function handleClickOutside(event) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Conta de ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="hidden lg:flex"
      >
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            aria-label="Menu da conta"
            style={{ position: "absolute", top: position.top, left: position.left, width: position.width }}
            className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                {user.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
              </div>
            </div>

            <div className="py-1">
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiUser size={15} aria-hidden="true" />
                Meu perfil
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <FiLogOut size={15} aria-hidden="true" />
                Sair
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
