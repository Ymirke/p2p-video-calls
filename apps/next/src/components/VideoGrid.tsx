export const VideoGrid = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  return (
    <>
      <div
        style={{
          height: "calc(100vh - 100px)",
          width: "100vw",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        {children}
      </div>
    </>
  );
};
