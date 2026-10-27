import React, { useState } from 'react';
import { Check, Eye, Plus, Sparkles, X } from 'lucide-react';
import { MENU_ITEMS } from '../../data/menuData';
import type {
  CameraSceneId,
  DishPortion,
  MenuCategory,
  MenuItem,
} from '../../types/restaurant';
import { ResilientImage } from '../ui/ResilientImage';

interface SignatureAndMenuProps {
  onAddToCart: (dish: MenuItem, portion: DishPortion) => void;
  onFocusScene: (scene: CameraSceneId | null) => void;
}

interface TiltCardProps {
  dish: MenuItem;
  onAddToCart: (dish: MenuItem, portion: DishPortion) => void;
  onInspect: (dish: MenuItem) => void;
}

const SignatureTiltCard: React.FC<TiltCardProps> = ({
  dish,
  onAddToCart,
  onInspect,
}) => {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [hovered, setHovered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const activePortion = dish.portions[selectedIdx] || dish.portions[0];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = nx * 11;
    const rotX = -ny * 11;
    setTiltStyle({
      transform: `perspective(1050px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(0, -4px, 0)`,
    });
  };

  const handlePointerLeave = () => {
    setHovered(false);
    setTiltStyle({
      transform: 'perspective(1050px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)',
    });
  };

  const triggerAdd = () => {
    onAddToCart(dish, activePortion);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      onPointerEnter={() => setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={tiltStyle}
      className="group relative flex flex-col justify-between bg-[#1A1615] border border-[#FFF4E0]/10 rounded-2xl overflow-hidden transition-transform duration-150 ease-out"
    >
      {/* Dish Visual + Hover Rotating 3D Plate Preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#121212]">
        <ResilientImage
          src={dish.image}
          alt={dish.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            hovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1615] via-black/25 to-transparent" />

        {/* Hover Rotating Plate Emblem + Quick Inspect Trigger */}
        <button
          type="button"
          onClick={() => onInspect(dish)}
          aria-label={`Inspect ${dish.name}`}
          className={`absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121212]/90 border border-[#FFF4E0]/15 text-xs font-medium text-[#FFF4E0] hover:border-[#F4A300] hover:text-[#F4A300] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-90'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-[#F4A300]" />
          <span>3D Plate View</span>
        </button>

        {/* Subtle Rotating Brass Rim Ring on Hover */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-10 -right-10 w-32 h-32 rounded-full border-2 border-dashed border-[#F4A300]/45 transition-all duration-700 ${
            hovered ? 'opacity-100 rotate-90 scale-110' : 'opacity-0 rotate-0 scale-90'
          }`}
        />
      </div>

      {/* Card Copy & Contiguous Portion Purchase Module */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean Unboxed Metadata (Zero Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#C9BBA6] mb-2">
            <span className="uppercase tracking-wider text-[#F4A300] font-medium">
              {dish.categoryLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>{dish.spiceLevel}</span>
          </div>

          <h3 className="font-display text-2xl font-bold text-[#FFF4E0] leading-snug">
            {dish.name}
          </h3>
          <p className="text-xs text-[#C9BBA6]/80 mt-0.5 mb-3">
            {dish.teluguName}
          </p>

          <p className="text-sm text-[#C9BBA6] leading-relaxed line-clamp-3 mb-5">
            {dish.description}
          </p>
        </div>

        <div className="pt-4 border-t border-[#FFF4E0]/10 space-y-3">
          {/* Interactive Portion Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#121212] border border-[#FFF4E0]/8">
            {dish.portions.map((portion, idx) => (
              <button
                key={portion.label}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded transition-colors whitespace-nowrap truncate cursor-pointer ${
                  selectedIdx === idx
                    ? 'bg-[#261F1D] text-[#FFF4E0] border border-[#F4A300]/40'
                    : 'text-[#C9BBA6] hover:text-[#FFF4E0]'
                }`}
              >
                {portion.label.replace('Royal ', '').replace('Nawab ', '')}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="tabular-nums">
              <span className="text-xl font-bold text-[#FFF4E0]">
                ₹{activePortion.price}
              </span>
              <span className="text-xs text-[#C9BBA6] ml-1.5">
                · {activePortion.serves}
              </span>
            </div>

            <button
              type="button"
              onClick={triggerAdd}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                justAdded
                  ? 'bg-emerald-500 text-[#121212]'
                  : 'bg-[#F4A300] hover:bg-[#FFB92E] text-[#121212]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Handi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export const SignatureAndMenu: React.FC<SignatureAndMenuProps> = ({
  onAddToCart,
  onFocusScene,
}) => {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('all');
  const [inspectedDish, setInspectedDish] = useState<MenuItem | null>(null);
  const [addedMenuMap, setAddedMenuMap] = useState<Record<string, boolean>>({});
  const [selectedPortions, setSelectedPortions] = useState<
    Record<string, number>
  >({});

  const signatureDishes = MENU_ITEMS.filter((item) => item.signature);
  const filteredMenu =
    activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  const categories: { id: MenuCategory; label: string }[] = [
    { id: 'all', label: 'All Dishes' },
    { id: 'dum-biryani', label: 'Royal Dum Biryani' },
    { id: 'starters', label: 'Tandoor & Starters' },
    { id: 'soups-curries', label: 'Bone Soups & Curries' },
    { id: 'desserts-chai', label: 'Desserts & Chai' },
  ];

  const handleMenuAdd = (dish: MenuItem) => {
    const idx = selectedPortions[dish.id] ?? 0;
    const portion = dish.portions[idx] || dish.portions[0];
    onAddToCart(dish, portion);
    setAddedMenuMap((prev) => ({ ...prev, [dish.id]: true }));
    window.setTimeout(() => {
      setAddedMenuMap((prev) => ({ ...prev, [dish.id]: false }));
    }, 1100);
  };

  return (
    <>
      {/* SIGNATURE DISHES (3D-Tilt Showcase Cards, Scene 03 Plated Dastarkhwan) */}
      <section
        id="signatures"
        onMouseEnter={() => onFocusScene('plated')}
        onMouseLeave={() => onFocusScene(null)}
        className="relative z-10 py-24 px-5 sm:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-medium text-[#F4A300] mb-2">
                House Specialties · మా ప్రత్యేక వంటకాలు
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF4E0]">
                Signature Royal Creations
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#C9BBA6] max-w-md">
              Tilt any card to inspect the plating or select your preferred
              handi size—accompanied by complimentary Mirchi ka Salan and mint
              burani raita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {signatureDishes.map((dish) => (
              <SignatureTiltCard
                key={dish.id}
                dish={dish}
                onAddToCart={onAddToCart}
                onInspect={(d) => setInspectedDish(d)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* COMPLETE DASTARKHWAN MENU SECTION */}
      <section
        id="menu"
        onMouseEnter={() => onFocusScene('plated')}
        onMouseLeave={() => onFocusScene(null)}
        className="relative z-10 py-24 px-5 sm:px-8 border-t border-[#FFF4E0]/10 bg-[#141110]/90"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-medium text-[#F4A300] mb-2">
                Full Dastarkhwan · ₹400–600 per person
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF4E0]">
                The Nawabs Menu
              </h2>
            </div>

            {/* Interactive Segmented Category Filter Controls */}
            <div
              role="tablist"
              aria-label="Filter menu by category"
              className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#1C1716] border border-[#FFF4E0]/10 rounded-xl"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#F4A300] text-[#121212] font-semibold'
                      : 'text-[#C9BBA6] hover:text-[#FFF4E0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenu.map((item) => {
              const pIdx = selectedPortions[item.id] ?? 0;
              const currentPortion = item.portions[pIdx] || item.portions[0];
              const isAdded = Boolean(addedMenuMap[item.id]);

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-[#1A1615] border border-[#FFF4E0]/10 hover:border-[#FFF4E0]/20 transition-colors"
                >
                  <div className="sm:w-36 sm:h-36 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden shrink-0 bg-[#121212]">
                    <ResilientImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Clean Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#C9BBA6] mb-1.5">
                        <span
                          className={
                            item.dietary === 'Veg'
                              ? 'text-emerald-400 font-medium'
                              : 'text-[#F4A300] font-medium'
                          }
                        >
                          {item.dietary}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.spiceLevel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.prepTime}</span>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FFF4E0]">
                          {item.name}
                        </h3>
                        <span className="text-lg font-bold text-[#FFF4E0] tabular-nums shrink-0">
                          ₹{currentPortion.price}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#C9BBA6] mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-[#FFF4E0]/8">
                      {item.portions.length > 1 ? (
                        <select
                          aria-label={`Select portion for ${item.name}`}
                          value={pIdx}
                          onChange={(e) =>
                            setSelectedPortions((prev) => ({
                              ...prev,
                              [item.id]: Number(e.target.value),
                            }))
                          }
                          className="bg-[#121212] text-xs text-[#FFF4E0] border border-[#FFF4E0]/15 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F4A300]"
                        >
                          {item.portions.map((p, i) => (
                            <option key={p.label} value={i}>
                              {p.label} ({p.serves}) — ₹{p.price}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-[#C9BBA6]">
                          {currentPortion.label} · {currentPortion.serves}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleMenuAdd(item)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500 text-[#121212]'
                            : 'bg-[#261F1D] hover:bg-[#F4A300] text-[#FFF4E0] hover:text-[#121212] border border-[#FFF4E0]/15 hover:border-transparent'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Bag</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE 3D ROTATING PLATE INSPECTOR MODAL */}
      {inspectedDish && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={inspectedDish.name}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setInspectedDish(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#1A1615] border border-[#FFF4E0]/15 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setInspectedDish(null)}
              aria-label="Close dish preview"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#121212]/85 text-[#FFF4E0] hover:text-[#F4A300] border border-[#FFF4E0]/15 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-12">
              {/* Interactive Rotating Sculpted Platter Showcase */}
              <div className="sm:col-span-6 relative bg-[#121212] p-6 flex flex-col items-center justify-center min-h-[280px] overflow-hidden">
                <div
                  className="relative w-52 h-52 rounded-full p-2 border-2 border-[#F4A300]/55 shadow-2xl animate-[spin_26s_linear_infinite]"
                  style={{
                    boxShadow: `0 20px 50px -12px ${inspectedDish.plateAccentHex}55`,
                  }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border border-[#FFF4E0]/20">
                    <ResilientImage
                      src={inspectedDish.image}
                      alt={inspectedDish.name}
                      className="w-full h-full object-cover scale-110"
                    />
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-[#C9BBA6]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4A300]" />
                  <span>360° Royal Dastarkhwan Plate Inspection</span>
                </span>
              </div>

              <div className="sm:col-span-6 p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-[#F4A300] font-medium mb-1">
                    {inspectedDish.categoryLabel} · {inspectedDish.spiceLevel}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-[#FFF4E0]">
                    {inspectedDish.name}
                  </h3>
                  <p className="text-xs text-[#C9BBA6] mt-0.5 mb-3">
                    {inspectedDish.teluguName}
                  </p>
                  <p className="text-sm text-[#C9BBA6] leading-relaxed mb-4">
                    {inspectedDish.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-[#FFF4E0]/10">
                    <p className="text-xs font-semibold text-[#FFF4E0]">
                      Tasting & Preparation Notes
                    </p>
                    <p className="text-xs text-[#C9BBA6]">
                      {inspectedDish.keyNotes.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#FFF4E0]/10 space-y-2.5">
                  {inspectedDish.portions.map((portion) => (
                    <button
                      key={portion.label}
                      type="button"
                      onClick={() => {
                        onAddToCart(inspectedDish, portion);
                        setInspectedDish(null);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#241E1C] hover:bg-[#F4A300] text-[#FFF4E0] hover:text-[#121212] text-xs font-semibold transition-colors tabular-nums cursor-pointer"
                    >
                      <span>
                        Add {portion.label} ({portion.serves})
                      </span>
                      <span>₹{portion.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
