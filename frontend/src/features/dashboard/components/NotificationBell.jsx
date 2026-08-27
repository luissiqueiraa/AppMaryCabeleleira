import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { FiBell, FiCheckCircle, FiClock, FiInfo } from "react-icons/fi";
import { listNotifications, markNotificationsRead } from "../services/notificationService";
import { formatRelativeDate } from "../../../shared/utils/formatDate";

const ICONS = { confirmation: FiCheckCircle, reminder: FiClock, update: FiInfo };
const PANEL_WIDTH = 340;
const PANEL_MARGIN = 12;

export default function NotificationBell({ className = "" }) {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const hasUnread = notifications.some((item) => !item.read);

  useEffect(() => {
    let isMounted = true;
    listNotifications()
      .then(({ data }) => {
        if (!isMounted) return;
        setNotifications(data);
        setLoadStatus("success");
      })
      .catch(() => {
        if (isMounted) setLoadStatus("error");
      });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

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

    if (notifications.some((item) => !item.read)) {
      markNotificationsRead()
        .then(() => setNotifications((prev) => prev.map((item) => ({ ...item, read: true }))))
        .catch(() => {});
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificações"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 ${className}`}
      >
        <FiBell size={18} aria-hidden="true" />
        {hasUnread && (
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-pink-500" aria-hidden="true" />
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            aria-label="Notificações"
            style={{ position: "absolute", top: position.top, left: position.left, width: position.width }}
            className="z-50 max-h-[70vh] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="font-display text-sm font-semibold text-gray-900">Notificações</p>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {loadStatus === "loading" && <p className="p-3 text-sm text-gray-500">Carregando...</p>}

              {loadStatus === "error" && (
                <p className="p-3 text-sm text-red-600">Não foi possível carregar agora.</p>
              )}

              {loadStatus === "success" && notifications.length === 0 && (
                <p className="p-3 text-sm text-gray-400">Você não tem notificações por aqui.</p>
              )}

              {loadStatus === "success" &&
                notifications.map((notification) => {
                  const Icon = ICONS[notification.type] ?? FiInfo;
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 rounded-md p-2.5 ${
                        notification.read ? "" : "bg-pink-50/60"
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                        <Icon size={14} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <p className="mt-0.5 text-sm text-gray-500">{notification.description}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatRelativeDate(notification.createdAt)}</p>
                      </div>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pink-500" aria-hidden="true" />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
