import React, { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

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

  // State untuk RND Cost dan Settings
  const [rndCost, setRndCost] = useState<number>(125000);
  const [quantity, setQuantity] = useState<number>(100);
  const [markupPercent, setMarkupPercent] = useState<number>(2);
  const [showSettings, setShowSettings] = useState<boolean>(false);

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

  // Biaya RND = Total HPP - Biaya Sewing Komponen Utama + RND Cost
  const biayaRnd =
    totalHpp > 0
      ? (totalHpp - (components[0]?.sewingCost || 0) + rndCost) / quantity
      : 0;

  // HPP + markup% = (Total HPP + Biaya RND) x markup% + Total HPP
  const hpp = totalHpp > 0 ? (totalHpp + biayaRnd) * (markupPercent / 100) : 0;

  const ppn = totalHpp > 0 ? (totalHpp + biayaRnd) * (10 / 100) + hpp : 0;

  const finalprice = totalHpp + biayaRnd + hpp + ppn;

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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="h-9"
            >
              ⚙️ Settings
            </Button>
            <ModeToggle />
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <section className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Pengaturan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  RND Cost (Rp)
                </label>
                <Input
                  type="number"
                  placeholder="125000"
                  value={rndCost || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setRndCost(value);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Biaya tambahan untuk RND yang akan ditambahkan ke perhitungan
                  Biaya RND
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Quantity
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={quantity || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setQuantity(value);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Jumlah produk yang akan dihitung untuk RND Cost. Misalnya,
                  jika Anda ingin menghitung biaya per 100 baju, masukkan 100.
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Markup Percent (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="2"
                  value={markupPercent || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setMarkupPercent(value);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Persentase markup yang akan ditambahkan ke total HPP dan Biaya
                  RND
                </p>
              </div>
            </div>
          </section>
        )}

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
                  <div className="flex rounded-lg overflow-hidden border border-input bg-background items-center">
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="border-0 rounded-none focus-visible:ring-0"
                      value={inputs.amount || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        updateComponent(idx, { amount: value });
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
                  <Input
                    type="number"
                    placeholder="0"
                    value={inputs.pricePerMeter || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      updateComponent(idx, { pricePerMeter: value });
                    }}
                  />
                </div>

                {/* ====== Biaya Pengiriman ====== */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Biaya Pengiriman (Rp)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={inputs.shippingCost || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      updateComponent(idx, { shippingCost: value });
                    }}
                  />
                </div>

                {/* ====== Biaya Sewing ====== */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Biaya Sewing (Rp)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={inputs.sewingCost || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      updateComponent(idx, { sewingCost: value });
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-sm text-muted-foreground mb-2">
                Biaya RND untuk {quantity} pcs
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                Rp{" "}
                {biayaRnd.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                HPP {markupPercent}% (Total HPP + Biaya RND)
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rp{" "}
                {hpp.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                PPN 10% (Total HPP + Biaya RND + HPP)
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rp{" "}
                {ppn.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">FInal Price</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rp{" "}
                {finalprice.toLocaleString("id-ID", {
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
