import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";

export default function HistoryTable({ items }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          <th className="pb-3 font-semibold">Data</th>
          <th className="pb-3 font-semibold">Serviço</th>
          <th className="pb-3 font-semibold">Profissional</th>
          <th className="pb-3 font-semibold">Valor</th>
          <th className="pb-3 font-semibold">Status</th>
          <th className="pb-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((item) => (
          <tr key={item.id}>
            <td className="py-4 pr-4 align-middle whitespace-nowrap">
              <p className="font-medium text-gray-900">{item.date}</p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </td>
            <td className="py-4 pr-4 align-middle">
              <div className="flex items-center gap-3">
                <img
                  src="/Mary_Cabelereira.jpeg"
                  alt=""
                  aria-hidden="true"
                  className="h-9 w-9 shrink-0 rounded-lg object-cover"
                />
                <p className="font-semibold text-gray-900">{item.service}</p>
              </div>
            </td>
            <td className="py-4 pr-4 align-middle text-gray-600">{item.professional}</td>
            <td className="py-4 pr-4 align-middle font-semibold text-gray-900">{item.price}</td>
            <td className="py-4 pr-4 align-middle">
              <StatusBadge status={item.status} />
            </td>
            <td className="py-4 text-right align-middle">
              {item.status === "completed" ? (
                <Link
                  to="/appointments/new"
                  className="inline-flex rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Repetir
                </Link>
              ) : (
                <FiChevronRight className="inline text-gray-400" aria-hidden="true" />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
