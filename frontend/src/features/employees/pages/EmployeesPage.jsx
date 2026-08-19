import { useState } from "react";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import EmployeeCard from "../components/EmployeeCard";
import { employees, employeeFilters } from "../data/mockEmployees";

export default function EmployeesPage() {
  const [filter, setFilter] = useState("all");

  const filteredEmployees =
    filter === "all" ? employees : employees.filter((employee) => employee.specialty === filter);

  return (
    <div className="space-y-6">
      <AutocompleteFilter
        options={employeeFilters}
        value={filter}
        onChange={setFilter}
        ariaLabel="Filtrar funcionárias"
        placeholder="Filtrar por especialidade"
      />

      {filteredEmployees.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Nenhuma funcionária encontrada para esse filtro.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}
    </div>
  );
}
