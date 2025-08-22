import SubmissionForm from "@/components/submissionForm";
import EventsDate from "@/components/svg/EventDate";
import MainLogo from "@/components/svg/Main";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-10 lg:gap-12">
        <div className="flex flex-col md:max-w-[80%] lg:max-w-none mx-auto">
          <div className="flex justify-center px-9">
            <MainLogo />
          </div>

          <div className="text-center max-w-[577px] mx-auto flex flex-col items-center justify-center">
            <div className="flex flex-col my-12 justify-center items-center w-full">
              <EventsDate />
            </div>
            <h3
              className="text-3xl text-white"
              style={{
                textAlign: "center",
                fontFamily: "RH Serif",
                fontSize: "15px",
                fontStyle: "normal",
                fontWeight: "300",
                lineHeight: "20px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              23 Avenue des Champs-élysées
            </h3>
          </div>
        </div>

        <SubmissionForm />
      </main>
    </div>
  );
}
