import React, { useState } from "react";
import { 
  HeartHandshake, 
  BookOpen, 
  Tag, 
  Pill, 
  Plus, 
  ShoppingBag, 
  Printer, 
  CheckCircle2, 
  Search,
  Sparkles
} from "lucide-react";
import { BookItem } from "../types";

interface HerbalLibraryModuleProps {
  activeSubTab?: "herbal_remedies" | "herbal_books" | "herbal_promos";
}

const INITIAL_BOOKS: BookItem[] = [
  {
    id: "BOOK-001",
    title: "Kitabu cha Tiba za Miti Shamba na Sunnah za Mtume",
    author: "Dr. Khalifa Rehani",
    category: "Tiba Asili",
    price: 25000,
    stock: 40,
    description: "Mwongozo wa matumizi ya Habat Soda, Asali na Zamzam kwa ajili ya afya njema."
  },
  {
    id: "BOOK-002",
    title: "Mwongozo wa Lishe Bora na Kinga ya Magonjwa",
    author: "Al-Furqan Publishing",
    category: "Lishe & Afya",
    price: 15000,
    stock: 25,
    description: "Maelekezo sahihi ya kujikinga na kisukari, BP na matatizo ya tumbo."
  }
];

export function HerbalLibraryModule({ activeSubTab = "herbal_remedies" }: HerbalLibraryModuleProps) {
  const [subTab, setSubTab] = useState<"herbal_remedies" | "herbal_books" | "herbal_promos">(activeSubTab);
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleBuyBook = (book: BookItem) => {
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, stock: Math.max(0, b.stock - 1) } : b));
    setSuccessMsg(`Mauzo ya kitabu '${book.title}' yamekamilika! TZS ${book.price.toLocaleString()}`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-rose-600" />
            <span>TIBA ASILI, MAKTABA NA MAUZO YA VITABU</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Usimamizi wa Tiba za Miti Shamba, Vitabu vya Afya na Promotions</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Catalogue</span>
        </button>
      </div>

      {/* SubTab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setSubTab("herbal_remedies")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "herbal_remedies" ? "bg-rose-700 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>1. Tiba za Miti Shamba & Asili</span>
        </button>

        <button
          onClick={() => setSubTab("herbal_books")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "herbal_books" ? "bg-rose-700 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Maktaba & Mauzo ya Vitabu</span>
        </button>

        <button
          onClick={() => setSubTab("herbal_promos")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "herbal_promos" ? "bg-rose-700 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>3. Ofa & Promotion Campaigns</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SubTab 1: Herbal Remedies */}
      {subTab === "herbal_remedies" && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-primary uppercase">Mchanganuo wa Tiba za Asili Zilizopo Clinic:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-2">
              <span className="text-xs font-black text-emerald-900 uppercase">1. Habat Soda Oils & Capsules</span>
              <p className="text-xs text-gray-700">Mafuta safi ya Habat Soda kwa ajili ya kuongeza kinga na kutibu matatizo ya pumzi.</p>
              <p className="text-xs font-mono font-bold text-primary">TZS 15,000 / Bote</p>
            </div>

            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
              <span className="text-xs font-black text-amber-900 uppercase">2. Asali Safi ya Nyuki</span>
              <p className="text-xs text-gray-700">Asali ya asili isiyochanganywa kwa ajili ya vidonda vya tumbo na kuimarisha mwili.</p>
              <p className="text-xs font-mono font-bold text-primary">TZS 20,000 / Bote</p>
            </div>

            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
              <span className="text-xs font-black text-rose-900 uppercase">3. Dawa za Miti Shamba Ya Tumbo</span>
              <p className="text-xs text-gray-700">Unga wa Miti Asili wa kusafisha mfumo wa chakula na kuondoa gesi.</p>
              <p className="text-xs font-mono font-bold text-primary">TZS 10,000 / Pkt</p>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Books */}
      {subTab === "herbal_books" && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-primary uppercase">Vitabu vya Afya na Tiba za Sunnah Zilizopo Dukan:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map(b => (
              <div key={b.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-primary uppercase">{b.title}</p>
                  <p className="text-xs text-gray-600 font-semibold">Mwandishi: {b.author}</p>
                  <p className="text-xs text-slate-500">{b.description}</p>
                  <p className="text-xs font-mono font-black text-rose-600 pt-1">
                    Bei: TZS {b.price.toLocaleString()} | Stoki: {b.stock} Copies
                  </p>
                </div>
                <button
                  onClick={() => handleBuyBook(b)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex-shrink-0 cursor-pointer"
                >
                  Uza Kitabu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Offers */}
      {subTab === "herbal_promos" && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-primary uppercase">Ofa na Kampeni za Punguzo la Bei:</h3>
          <div className="p-4 bg-gradient-to-r from-rose-600 to-primary text-white rounded-xl shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h4 className="font-black text-sm uppercase">PROMOTION: PAKETI YA HABAT SODA + ASALI</h4>
            </div>
            <p className="text-xs text-slate-100">
              Pata punguzo la 15% pale unaponunua Mafuta ya Habat Soda Pamoja na Boti ya Asali kwa Pamoja. TZS 30,000 pekee badala ya TZS 35,000!
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default HerbalLibraryModule;
