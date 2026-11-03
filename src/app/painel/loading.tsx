export default function Carregando() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-40 rounded-lg bg-borda" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-cartao bg-borda/70" />
        ))}
      </div>
      <div className="h-64 rounded-cartao bg-borda/60" />
    </div>
  );
}
