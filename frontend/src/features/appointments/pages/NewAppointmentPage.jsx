import { useNavigate, Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useAuth } from "../../../shared/contexts/useAuth";
import Sidebar from "../../dashboard/components/Sidebar";
import DashboardHeader from "../../dashboard/components/DashboardHeader";
import { useBookingFlow } from "../hooks/useBookingFlow";
import BookingHeader from "../components/BookingHeader";
import ServiceList from "../components/ServiceList";
import ProfessionalList from "../components/ProfessionalList";
import DateTimeSection from "../components/DateTimeSection";
import BookingSummaryCard from "../components/BookingSummaryCard";
import BookingConfirmationModal from "../components/BookingConfirmationModal";
import BookingSuccess from "../components/BookingSuccess";
import PixPaymentPanel from "../components/PixPaymentPanel";

const TOTAL_STEPS = 4;

export default function NewAppointmentPage() {
  const flow = useBookingFlow();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (flow.status === "success") {
    return (
      <BookingSuccess professionalName={flow.professionalName} dateLabel={flow.dateLabel} time={flow.time} />
    );
  }

  // Pix: o agendamento ainda não existe — a tela espera a confirmação do
  // pagamento, que é quando o horário passa a ser dela.
  if (flow.status === "awaitingPayment" && flow.payment) {
    return <PixPaymentPanel payment={flow.payment} onCancel={flow.cancelPayment} />;
  }

  const stepIsValid = {
    1: flow.selectedServices.length > 0,
    2: Boolean(flow.professionalId),
    3: Boolean(flow.date && flow.time),
  }[flow.step];

  function handleMobileContinue() {
    flow.setStep(flow.step + 1);
  }

  return (
    <div className="lg:flex lg:h-screen lg:bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <div className="lg:flex lg:h-screen lg:flex-1 lg:flex-col lg:overflow-hidden">
        <div className="hidden lg:block">
          <DashboardHeader
            eyebrow="Novo agendamento"
            title="Agendar horário"
            user={{ name: user?.fullName ?? "", email: user?.email, avatarUrl: user?.avatarUrl }}
            onOpenMenu={() => {}}
            onLogout={handleLogout}
            headerAction={
              <Link
                to="/dashboard"
                aria-label="Fechar e voltar para a página principal"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <FiX size={18} aria-hidden="true" />
              </Link>
            }
          />
        </div>

        <BookingHeader step={flow.step} totalSteps={TOTAL_STEPS} onBack={flow.goBack} />

        <div className="pb-24 lg:flex-1 lg:overflow-y-auto lg:pb-10">
          {flow.catalogError && (
            <p role="alert" className="mx-4 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 lg:mx-8">
              Não foi possível carregar serviços e profissionais agora. Tente novamente em instantes.
            </p>
          )}

          {/* O assistente por etapas continua até lg. Sem o max-w ele esticava
              de ponta a ponta no tablet, deixando cards enormes e vazios. */}
          <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:hidden">
            <div className={flow.step === 1 ? "block" : "hidden"}>
              <ServiceList
                services={flow.services}
                isLoading={flow.isLoadingCatalog}
                selectedIds={flow.selectedServices.map((item) => item.id)}
                onToggle={flow.toggleService}
              />
            </div>

            <div className={flow.step === 2 ? "block" : "hidden"}>
              <ProfessionalList
                professionals={flow.professionals}
                isLoading={flow.isLoadingCatalog}
                selectedId={flow.professionalId}
                onSelect={flow.selectProfessional}
                selectedServices={flow.selectedServices}
                totalDuration={flow.totalDuration}
                onEditService={() => flow.setStep(1)}
              />
            </div>

            <div className={flow.step === 3 || flow.step === 4 ? "block" : "hidden"}>
              <DateTimeSection
                selectedDate={flow.date}
                selectedTime={flow.time}
                onSelectDate={flow.selectDate}
                onSelectTime={flow.selectTime}
                hours={flow.hours}
                slots={flow.slots}
                unavailableTimes={flow.unavailableTimes}
                isLoadingAvailability={flow.isLoadingAvailability}
                totalDuration={flow.totalDuration}
                latestStart={flow.latestStart}
              />
            </div>
          </div>

          {flow.step === 4 && (
            <BookingConfirmationModal
              services={flow.selectedServices}
              totalDuration={flow.totalDuration}
              totalPrice={flow.totalPrice}
              professional={flow.professional}
              professionalName={flow.professionalName}
              date={flow.date}
              dateLabel={flow.dateLabel}
              time={flow.time}
              paymentMethod={flow.paymentMethod}
              onPaymentMethodChange={flow.setPaymentMethod}
              onlinePaymentsEnabled={flow.onlinePaymentsEnabled}
              notes={flow.notes}
              onNotesChange={flow.setNotes}
              isLoading={flow.status === "loading"}
              isComplete={flow.isComplete}
              onConfirm={flow.confirm}
              onClose={() => flow.setStep(3)}
              onEditService={() => flow.setStep(1)}
            />
          )}

          <div className="hidden lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8 lg:px-8 lg:py-8">
            <div className="space-y-6">
              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <ServiceList
                  services={flow.services}
                  isLoading={flow.isLoadingCatalog}
                  selectedIds={flow.selectedServices.map((item) => item.id)}
                  onToggle={flow.toggleService}
                />
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <ProfessionalList
                  professionals={flow.professionals}
                  isLoading={flow.isLoadingCatalog}
                  selectedId={flow.professionalId}
                  onSelect={flow.selectProfessional}
                />
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <DateTimeSection
                  heading="Data & horário"
                  selectedDate={flow.date}
                  selectedTime={flow.time}
                  onSelectDate={flow.selectDate}
                  onSelectTime={flow.selectTime}
                  hours={flow.hours}
                  slots={flow.slots}
                  unavailableTimes={flow.unavailableTimes}
                  isLoadingAvailability={flow.isLoadingAvailability}
                  totalDuration={flow.totalDuration}
                  latestStart={flow.latestStart}
                />
              </section>
            </div>

            <BookingSummaryCard
              services={flow.selectedServices}
              totalDuration={flow.totalDuration}
              totalPrice={flow.totalPrice}
              professionalName={flow.professionalName}
              dateLabel={flow.dateLabel}
              time={flow.time}
              paymentMethod={flow.paymentMethod}
              onPaymentMethodChange={flow.setPaymentMethod}
              onlinePaymentsEnabled={flow.onlinePaymentsEnabled}
              isLoading={flow.status === "loading"}
              isComplete={flow.isComplete}
              onConfirm={flow.confirm}
            />
          </div>
        </div>
      </div>

      {flow.step < TOTAL_STEPS && (
        <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white p-4 lg:hidden">
          <button
            type="button"
            onClick={handleMobileContinue}
            disabled={!stepIsValid}
            className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
