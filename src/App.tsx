import React, { useState } from "react";

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
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Calculator Baju</h1>

      {components.map((inputs, idx) => {
        // Judul section:
        const title = idx === 0 ? "Komponen Utama" : `Tambahan Kain ${idx}`;

        return (
          <section
            key={idx}
            className="border rounded-lg p-4 space-y-4 relative"
          >
            {/* Header dengan tombol Hapus (jika idx > 0) */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">{title}</h2>
              {idx > 0 && (
                <button
                  onClick={() => removeComponent(idx)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Hapus
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* ====== Kebutuhan Kain ====== */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kebutuhan Kain
                </label>
                <div className="flex">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-2/3 border rounded-l px-3 py-2"
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
                    className="w-1/3 border-l-0 border rounded-r px-2"
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Harga Kain (per meter)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full border rounded px-3 py-2"
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Biaya Pengiriman (Rp)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full border rounded px-3 py-2"
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Biaya Sewing (Rp)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full border rounded px-3 py-2"
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
            <div className="mt-4 space-y-1">
              <p>
                <span className="font-medium">Kebutuhan dalam meter: </span>
                {toMeter(inputs.amount, inputs.unit).toLocaleString("id-ID", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                m
              </p>
              <p>
                <span className="font-medium">Biaya Kain: </span>
                Rp{" "}
                {fabricCost(inputs).toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <p>
                <span className="font-medium">Subtotal {title}: </span>
                Rp{" "}
                {subtotal(inputs).toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </section>
        );
      })}

      {/* Button untuk menambah Tambahan Kain */}
      <button
        onClick={addComponent}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Tambahan Kain
      </button>

      {/* ====== Summary ====== */}
      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-medium">Summary</h2>
        <p>
          <span className="font-medium">Total HPP (Semua Komponen): </span>
          Rp{" "}
          {totalHpp.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
        <p>
          <span className="font-medium">HPP + 2 %: </span>
          Rp{" "}
          {hppPlus2.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
      </section>
    </div>
  );
};
