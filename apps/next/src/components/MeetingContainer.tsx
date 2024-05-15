export function MeetingContainer({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        backgroundColor: "#1d1e20",
        height: "100vh",
        width: "100vw",
      }}
    >
      {children}
    </main>
  );
}
