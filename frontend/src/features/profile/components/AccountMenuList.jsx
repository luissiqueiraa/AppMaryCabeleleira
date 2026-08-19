import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiCheck, FiCamera } from "react-icons/fi";
import Avatar from "../../dashboard/components/Avatar";

export default function AccountMenuList({ profile, items, onAvatarChange, isUploadingAvatar }) {
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) onAvatarChange?.(file);
    event.target.value = "";
  }

  return (
    <nav
      aria-label="Opções da conta"
      className="divide-y divide-gray-100 bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:shadow-sm"
    >
      <div className="flex items-center gap-4 py-4 lg:p-6">
        <div className="relative shrink-0">
          <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" />
          {onAvatarChange && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label="Alterar foto de perfil"
              className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-pink-600 text-white shadow-sm transition-colors hover:bg-pink-700 disabled:opacity-60"
            >
              <FiCamera size={13} aria-hidden="true" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-gray-900">{profile.name}</p>
          <p className="truncate text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>

      {items.map((item) => {
        const Icon = item.icon;
        const rowClass = "flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-gray-50 lg:px-6";

        const content = (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-pink-500">
              <Icon size={16} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
              <span className="mt-0.5 block text-xs text-gray-500">{item.description}</span>
            </span>
            {item.badge && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <FiCheck size={12} aria-hidden="true" />
                {item.badge}
              </span>
            )}
            <span className="flex shrink-0 items-center text-gray-300">
              {Array.from({ length: item.chevrons ?? 1 }).map((_, index) => (
                <FiChevronRight key={index} className={index > 0 ? "-ml-2" : ""} aria-hidden="true" />
              ))}
            </span>
          </>
        );

        if (item.onClick) {
          return (
            <button key={item.label} type="button" onClick={item.onClick} className={rowClass}>
              {content}
            </button>
          );
        }

        return (
          <Link key={item.label} to={item.to} className={rowClass}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
