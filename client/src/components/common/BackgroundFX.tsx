export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(40rem 30rem at 10% 0%, rgba(16,185,129,0.18), transparent 60%),
            radial-gradient(48rem 36rem at 90% 10%, rgba(99,102,241,0.16), transparent 55%),
            radial-gradient(42rem 30rem at 10% 100%, rgba(251,146,60,0.12), transparent 60%),
            linear-gradient(to bottom, #ecfdf5 0%, #ffffff 45%)
          `,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed, fixed, fixed, fixed",
        }}
      />
      
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(17,24,39,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17,24,39,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          WebkitMaskImage:
            "radial-gradient(ellipse at 60% 20%, rgba(0,0,0,0.2), transparent 70%)",
          maskImage:
            "radial-gradient(ellipse at 60% 20%, rgba(0,0,0,0.2), transparent 70%)",
        }}
      />
    </div>
  );
}