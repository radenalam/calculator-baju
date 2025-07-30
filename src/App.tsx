import React, { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";
import { Button } from "./components/ui/button";

type Unit = "yard" | "meter";

interface ComponentInputs {
  amount: number; // Kebutuhan Kain
  unit: Unit; // "yard" atau "meter"
  pricePerMeter: number; // Harga Kain (per meter)
  shippingCost: number; // Biaya Pengiriman (Rp)
  sewingCost: number; // Biaya Sewing (Rp)
}

export const App: React.FC = () => {
  // Default satu komponen utama
  const defaultComponent: ComponentInputs = {
    amount: 0,
    unit: "meter",
    pricePerMeter: 0,
    shippingCost: 0,
    sewingCost: 0,
  };

  // State: array komponen, index 0 = Komponen Utama, sisanya Tambahan Kain
  const [components, setComponents] = useState<ComponentInputs[]>([
    { ...defaultComponent },
  ]);

  // Helper: format angka sesuai "id-ID"
  const formatNumber = (num: number, decimalDigits = 0) => {
    if (num === 0) return "";
    return num.toLocaleString("id-ID", {
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    });
  };

  // Helper: parse string input (bisa berupa "1.234,56") jadi number
  const parseNumber = (str: string) => {
    const cleaned = str.replace(/\./g, "").replace(/,/g, ".");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  // Konversi ke meter (1 yard = 1.1 meter)
  const toMeter = (amount: number, unit: Unit) =>
    unit === "yard" ? amount * 1.1 : amount;

  // Hitung biaya kain untuk satu komponen
  const fabricCost = (inputs: ComponentInputs) => {
    const meter = toMeter(inputs.amount, inputs.unit);
    return meter * inputs.pricePerMeter;
  };

  // Hitung subtotal = fabric + shipping + sewing
  const subtotal = (inputs: ComponentInputs) => {
    return fabricCost(inputs) + inputs.shippingCost + inputs.sewingCost;
  };

  // Hitung Total HPP: jumlahkan semua subtotal dalam array
  const totalHpp = components
    .map((c) => subtotal(c))
    .reduce((acc, curr) => acc + curr, 0);

  // HPP + 2%
  const hppPlus2 = totalHpp * 1.02;

  // Tambah satu komponen baru (defaultComponent)
  const addComponent = () => {
    setComponents((prev) => [...prev, { ...defaultComponent }]);
  };

  // Hapus komponen pada index tertentu (kecuali index 0)
  const removeComponent = (idx: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update komponen di index tertentu
  const updateComponent = (idx: number, newData: Partial<ComponentInputs>) => {
    setComponents((prev) =>
      prev.map((comp, i) => (i === idx ? { ...comp, ...newData } : comp))
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Calculator Baju
          </h1>
          <ModeToggle />
        </div>

        {components.map((inputs, idx) => {
          // Judul section:
          const title = idx === 0 ? "Komponen Utama" : `Tambahan Kain ${idx}`;

          return (
            <section
              key={idx}
              className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Header dengan tombol Hapus (jika idx > 0) */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {title}
                </h2>
                {idx > 0 && (
                  <Button
                    onClick={() => removeComponent(idx)}
                    variant="destructive"
                    size="sm"
                    className="h-8"
                  >
                    Hapus
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ====== Kebutuhan Kain ====== */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Kebutuhan Kain
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-input bg-background">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="0,00"
                      // Tampilkan dua desimal; kalau 0 → tampilkan ""
                      value={formatNumber(inputs.amount, 2)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const parsed = parseNumber(raw);
                        updateComponent(idx, { amount: parsed });
                      }}
                    />
                    <select
                      className="bg-muted/50 border-l border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={inputs.unit}
                      onChange={(e) =>
                        updateComponent(idx, {
                          unit: e.target.value as Unit,
                        })
                      }
                    >
                      <option value="yard">Yard</option>
                      <option value="meter">Meter</option>
                    </select>
                  </div>
                </div>

                {/* ====== Harga Kain per Meter ====== */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Harga Kain (per meter)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="0"
                    value={formatNumber(inputs.pricePerMeter, 0)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = parseNumber(raw);
                      updateComponent(idx, { pricePerMeter: parsed });
                    }}
                  />
                </div>

                {/* ====== Biaya Pengiriman ====== */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Biaya Pengiriman (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="0"
                    value={formatNumber(inputs.shippingCost, 0)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = parseNumber(raw);
                      updateComponent(idx, { shippingCost: parsed });
                    }}
                  />
                </div>

                {/* ====== Biaya Sewing ====== */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Biaya Sewing (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="0"
                    value={formatNumber(inputs.sewingCost, 0)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = parseNumber(raw);
                      updateComponent(idx, { sewingCost: parsed });
                    }}
                  />
                </div>
              </div>

              {/* ====== Ringkasan Perhitungan Komponen ====== */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-muted-foreground mb-3">
                  Ringkasan Perhitungan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Kebutuhan dalam meter:
                    </span>
                    <p className="font-medium">
                      {toMeter(inputs.amount, inputs.unit).toLocaleString(
                        "id-ID",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      m
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biaya Kain:</span>
                    <p className="font-medium">
                      Rp{" "}
                      {fabricCost(inputs).toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Subtotal {title}:
                    </span>
                    <p className="font-bold text-primary">
                      Rp{" "}
                      {subtotal(inputs).toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* Button untuk menambah Tambahan Kain */}
        <div className="flex justify-center">
          <Button onClick={addComponent} className="px-6 py-3 font-medium">
            + Tambahan Kain
          </Button>
        </div>

        {/* ====== Summary ====== */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Total HPP (Semua Komponen)
              </p>
              <p className="text-2xl font-bold text-primary">
                Rp{" "}
                {totalHpp.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">HPP + 2%</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rp{" "}
                {hppPlus2.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
